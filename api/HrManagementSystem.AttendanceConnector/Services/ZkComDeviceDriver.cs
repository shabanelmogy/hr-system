using System.Diagnostics;
using System.Runtime.InteropServices;
using HrManagementSystem.AttendanceConnector.Models;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.AttendanceConnector.Services;

public sealed class ZkComDeviceDriver : IDeviceDriver
{
    private const string ProgId = "zkemkeeper.ZKEM";
    private const int MachineNumber = 1;
    private readonly SemaphoreSlim _operationGate = new(1, 1);
    private readonly AttendanceConnectorOptions _options;

    public ZkComDeviceDriver(IOptions<AttendanceConnectorOptions> options) => _options = options.Value;
    public string ProviderId => "zkteco-com";

    public ProviderInfo GetInfo()
    {
        var activation = GetSdkInfo();
        return new ProviderInfo(ProviderId, "ZKTeco COM SDK", activation.Available, activation.Available,
            true, true, true, true, activation.Available ? null : "The ZKTeco x86 COM SDK could not be activated on this companion host.");
    }

    public (bool Available, string? Version) GetSdkInfo() => (CanActivateComComponent(), ReadSdkVersion());

    public Task<TestResult> TestConnectionAsync(DeviceEndpointRequest request, CancellationToken cancellationToken) =>
        RunExclusiveStaAsync(() => new TestResult(true, WithConnectedDevice(request, ReadDeviceInfo)), cancellationToken);

    public Task<PullUsersResult> PullUsersAsync(DeviceEndpointRequest request, CancellationToken cancellationToken) =>
        RunExclusiveStaAsync(() => WithConnectedDevice(request, zk =>
        {
            var device = ReadDeviceInfo(zk);
            if (!(bool)zk.ReadAllUserID(MachineNumber))
                throw FromLastError(zk, "USERS_PULL_FAILED", "The device could not provide its users.");

            var users = new List<RawDeviceUser>();
            var readCount = 0;
            var skippedCount = 0;
            string externalCode = string.Empty, name = string.Empty, password = string.Empty;
            var privilege = 0;
            var enabled = false;
            while ((bool)zk.SSR_GetAllUserInfo(MachineNumber, out externalCode, out name, out password, out privilege, out enabled))
            {
                readCount++;
                if (users.Count >= _options.MaxRecords)
                    throw new ConnectorException("LIMIT_EXCEEDED", "The device returned more records than this connector is configured to return.", StatusCodes.Status422UnprocessableEntity);
                if (string.IsNullOrWhiteSpace(externalCode)) { skippedCount++; continue; }
                // Password is deliberately read only because this COM signature requires it; it is never stored, logged, or returned.
                users.Add(new RawDeviceUser(externalCode, name ?? string.Empty, privilege, enabled));
            }

            return new PullUsersResult(device, DateTimeOffset.UtcNow, readCount, skippedCount, users);
        }), cancellationToken);

    public Task<PullAttendanceResult> PullAttendanceAsync(PullAttendanceRequest request, CancellationToken cancellationToken) =>
        RunExclusiveStaAsync(() => WithConnectedDevice(request, zk =>
        {
            var device = ReadDeviceInfo(zk);
            var names = ReadUserNames(zk);
            if (!(bool)zk.ReadGeneralLogData(MachineNumber))
                throw FromLastError(zk, "ATTENDANCE_PULL_FAILED", "The device could not provide its attendance logs.");

            var punches = new List<RawAttendancePunch>();
            var readCount = 0;
            var skippedCount = 0;
            string externalCode = string.Empty;
            var verifyMode = 0;
            var inOutMode = 0;
            var year = 0; var month = 0; var day = 0; var hour = 0; var minute = 0; var second = 0; var workCode = 0;
            try
            {
                while ((bool)zk.SSR_GetGeneralLogData(MachineNumber, out externalCode, out verifyMode, out inOutMode,
                           out year, out month, out day, out hour, out minute, out second, ref workCode))
                {
                    readCount++;
                    if (punches.Count >= _options.MaxRecords)
                        throw new ConnectorException("LIMIT_EXCEEDED", "The device returned more records than this connector is configured to return.", StatusCodes.Status422UnprocessableEntity);
                    DateTime occurredAt;
                    try { occurredAt = new DateTime(year, month, day, hour, minute, second, DateTimeKind.Unspecified); }
                    catch (ArgumentOutOfRangeException) { skippedCount++; continue; }
                    var deviceDate = DateOnly.FromDateTime(occurredAt);
                    if ((request.From is not null && deviceDate < request.From.Value) || (request.To is not null && deviceDate > request.To.Value))
                    {
                        skippedCount++;
                        continue;
                    }
                    names.TryGetValue(externalCode, out string? name);
                    punches.Add(new RawAttendancePunch(externalCode, name ?? string.Empty, occurredAt, verifyMode, inOutMode, workCode));
                }
            }
            catch (Microsoft.CSharp.RuntimeBinder.RuntimeBinderException)
            {
                throw new ConnectorException("ATTENDANCE_NOT_SUPPORTED", "This device or SDK version does not expose attendance-log reading.", StatusCodes.Status501NotImplemented);
            }
            catch (COMException exception) when (IsMissingAttendanceApi(exception))
            {
                throw new ConnectorException("ATTENDANCE_NOT_SUPPORTED", "This device or SDK version does not expose attendance-log reading.", StatusCodes.Status501NotImplemented);
            }

            return new PullAttendanceResult(device, DateTimeOffset.UtcNow, request.From, request.To, readCount, skippedCount, punches);
        }), cancellationToken);

    public async Task<DetectResult> DetectAsync(DeviceEndpointRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await TestConnectionAsync(request, cancellationToken);
            return result.Connected
                ? new DetectResult(true, ProviderId, 100, "A registered provider matched the submitted device address.")
                : new DetectResult(false, null, 0, "No registered provider matched the submitted device address.");
        }
        catch (ConnectorException)
        {
            return new DetectResult(false, null, 0, "No registered provider matched the submitted device address.");
        }
    }

    private T WithConnectedDevice<T>(DeviceEndpointRequest request, Func<dynamic, T> operation)
    {
        if (!OperatingSystem.IsWindows() || Environment.Is64BitProcess)
            throw new ConnectorException("SDK_NOT_AVAILABLE", "ZKTeco COM requires the Windows x86 connector process.", StatusCodes.Status503ServiceUnavailable);
        var type = Type.GetTypeFromProgID(ProgId, throwOnError: false);
        if (type is null) throw new ConnectorException("SDK_NOT_AVAILABLE", "The ZKTeco COM SDK is not registered on this host.", StatusCodes.Status503ServiceUnavailable);

        object? com = null;
        var connected = false;
        try
        {
            com = Activator.CreateInstance(type) ?? throw new COMException();
            dynamic zk = com;
            if (request.CommKey is not null && (!(int.TryParse(request.CommKey, out var commKey)) || !(bool)zk.SetCommPassword(commKey)))
                throw FromLastError(zk, "AUTH_FAILED", "The device communication key was rejected.");
            connected = (bool)zk.Connect_Net(request.Host.Trim(), request.Port);
            if (!connected) throw FromLastError(zk, "DEVICE_UNREACHABLE", "The device could not be reached.");
            return operation(zk);
        }
        catch (ConnectorException) { throw; }
        catch (COMException) { throw new ConnectorException("SDK_OPERATION_FAILED", "The ZKTeco SDK operation failed.", StatusCodes.Status502BadGateway); }
        catch { throw new ConnectorException("DEVICE_OPERATION_FAILED", "The device operation failed.", StatusCodes.Status502BadGateway); }
        finally
        {
            if (com is not null)
            {
                if (connected) { try { ((dynamic)com).Disconnect(); } catch { } }
                if (Marshal.IsComObject(com)) Marshal.FinalReleaseComObject(com);
            }
        }
    }

    private DeviceInfo ReadDeviceInfo(dynamic zk)
    {
        string serial = string.Empty, firmware = string.Empty, platform = string.Empty;
        try { _ = (bool)zk.GetSerialNumber(MachineNumber, out serial); } catch { }
        try { _ = (bool)zk.GetFirmwareVersion(MachineNumber, out firmware); } catch { }
        try { _ = (bool)zk.GetPlatform(MachineNumber, out platform); } catch { }
        return new DeviceInfo(EmptyToNull(serial), EmptyToNull(firmware), EmptyToNull(platform), ReadSdkVersion());
    }

    private static Dictionary<string, string> ReadUserNames(dynamic zk)
    {
        var names = new Dictionary<string, string>(StringComparer.Ordinal);
        try
        {
            if (!(bool)zk.ReadAllUserID(MachineNumber)) return names;
            string externalCode = string.Empty, name = string.Empty, password = string.Empty;
            var privilege = 0; var enabled = false;
            while ((bool)zk.SSR_GetAllUserInfo(MachineNumber, out externalCode, out name, out password, out privilege, out enabled))
                if (!string.IsNullOrWhiteSpace(externalCode)) names[externalCode] = name ?? string.Empty;
        }
        catch { /* A device's raw logs are still useful when its user index is unavailable. */ }
        return names;
    }

    private async Task<T> RunExclusiveStaAsync<T>(Func<T> operation, CancellationToken cancellationToken)
    {
        await _operationGate.WaitAsync(cancellationToken);
        TaskCompletionSource<bool>? exited = null;
        try
        {
            var completion = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);
            exited = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            var completedThread = exited;
            var thread = new Thread(() =>
            {
                try { completion.TrySetResult(operation()); }
                catch (Exception exception) { completion.TrySetException(exception); }
                finally { completedThread.TrySetResult(true); }
            }) { IsBackground = true, Name = "ZKTeco COM STA" };
            thread.SetApartmentState(ApartmentState.STA);
            try { thread.Start(); }
            catch
            {
                exited.TrySetResult(true);
                throw;
            }
            return await completion.Task.WaitAsync(cancellationToken);
        }
        finally
        {
            if (exited is null) _operationGate.Release();
            else _ = exited.Task.ContinueWith(_ => _operationGate.Release(), CancellationToken.None, TaskContinuationOptions.ExecuteSynchronously, TaskScheduler.Default);
        }
    }

    private static bool CanActivateComComponent()
    {
        if (!OperatingSystem.IsWindows() || Environment.Is64BitProcess) return false;
        var type = Type.GetTypeFromProgID(ProgId, throwOnError: false);
        if (type is null) return false;
        object? instance = null;
        try { instance = Activator.CreateInstance(type); return instance is not null; }
        catch { return false; }
        finally { if (instance is not null && Marshal.IsComObject(instance)) Marshal.FinalReleaseComObject(instance); }
    }

    private static ConnectorException FromLastError(dynamic zk, string code, string message)
    {
        var providerCode = 0;
        try { zk.GetLastError(ref providerCode); } catch { }
        return new ConnectorException(code, message, code == "AUTH_FAILED" ? StatusCodes.Status401Unauthorized : StatusCodes.Status502BadGateway, providerCode == 0 ? null : providerCode);
    }

    private static bool IsMissingAttendanceApi(COMException exception) => exception.HResult is unchecked((int)0x80020003) or unchecked((int)0x80020006) or unchecked((int)0x8002000E);
    private static string? EmptyToNull(string value) => string.IsNullOrWhiteSpace(value) ? null : value;
    private static string? ReadSdkVersion()
    {
        var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "SysWOW64", "zkemkeeper.dll");
        try { return File.Exists(path) ? FileVersionInfo.GetVersionInfo(path).FileVersion : null; } catch { return null; }
    }
}
