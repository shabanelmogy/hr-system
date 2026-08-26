using System.Text.Json;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Domain.Attendance.Devices.Entities;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Commands;

// Internal job-only message. Not exposed by any HTTP endpoint.
public sealed record ExecuteAttendancePullCommand(long RunId) : ICommand<bool>;

public sealed class ExecuteAttendancePullCommandHandler(
    IAttendanceRawStore store, IAttendanceCredentialProtector protector, IAttendanceNetworkPolicy network,
    IAttendanceConnectorClient connector, IUnitOfWork unitOfWork, TimeProvider clock, AttendanceDeviceEffects effects)
    : ICommandHandler<ExecuteAttendancePullCommand, bool>
{
    public async Task<bool> Handle(ExecuteAttendancePullCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return false;
        var run = await store.FindRunAsync(request.RunId, ct);
        if (run is null || run.Status is "completed" or "failed") return false;
        var device = run.AttendanceDevice;
        // Hosted HR never reaches a customer LAN. Assigned devices are claimed by their outbound site agent.
        if (device.AttendanceAgentId.HasValue) return false;
        if (!device.Enabled || !network.IsAllowed(device.Host, device.Port))
        {
            await FailAsync(run, "DEVICE_DISABLED_OR_TARGET_DENIED", ct);
            return false;
        }
        run.Status = "running";
        run.SafeError = null;
        await unitOfWork.SaveChangesAsync(ct);
        effects.Changed(device.Id);
        try
        {
            var credentials = device.Credential is null ? null : protector.Unprotect(device.Credential.ProtectedPayload);
            var endpoint = new ConnectorEndpoint(device.Host, device.Port, device.ProviderId, credentials?.CommKey);
            if (run.OperationType == "users")
            {
                var result = await connector.PullUsersAsync(endpoint, ct);
                if (result.Error is not null)
                {
                    await FailAsync(run, SafeCode(result.Error.Code), ct);
                    return false;
                }
                await unitOfWork.ExecuteAtomicallyAsync([effects.DeviceLock(device.Id)], async token =>
                {
                    await StoreUsersAsync(run, result, token);
                    await CompleteAsync(run, token);
                    return true;
                }, ct);
            }
            else
            {
                var zone = TimeZoneInfo.FindSystemTimeZoneById(device.TimeZoneId);
                var connectorRequest = new ConnectorAttendanceEndpoint(
                    endpoint.Host, endpoint.Port, endpoint.ProviderId, endpoint.CommKey,
                    ToDeviceDate(run.FromUtc, zone), ToDeviceDate(run.ToUtc, zone));
                var result = await connector.PullAttendanceAsync(connectorRequest, ct);
                if (result.Error is not null)
                {
                    await FailAsync(run, SafeCode(result.Error.Code), ct);
                    return false;
                }
                await unitOfWork.ExecuteAtomicallyAsync([effects.DeviceLock(device.Id)], async token =>
                {
                    await StorePunchesAsync(run, result, token);
                    await CompleteAsync(run, token);
                    return true;
                }, ct);
            }
            effects.Changed(device.Id);
            return true;
        }
        catch (System.Security.Cryptography.CryptographicException)
        {
            await FailAsync(run, "CREDENTIAL_UNAVAILABLE", ct);
            return false;
        }
        // Cancellation/database failures propagate to Hangfire; transaction rollback prevents partial inserts.
    }
    private async Task StoreUsersAsync(DevicePullRun run, ConnectorUsersResult result, CancellationToken ct)
    {
        run.ReadCount = result.ReadCount;
        run.SkippedCount = result.SkippedCount;
        run.InsertedCount = run.DuplicateCount = run.ErrorCount = 0;
        var codes = result.Users.Where(x => RawAttendanceConversion.ValidCode(x.ExternalCode))
            .Select(x => x.ExternalCode).Distinct(StringComparer.Ordinal).ToArray();
        var existing = new Dictionary<string, RawDeviceUser>(StringComparer.Ordinal);
        foreach (var batch in codes.Chunk(500))
            foreach (var user in await store.FindUsersAsync(run.AttendanceDeviceId, batch, ct))
                existing[user.ExternalCode] = user;
        foreach (var raw in result.Users)
        {
            if (!RawAttendanceConversion.ValidCode(raw.ExternalCode)) { run.SkippedCount++; continue; }
            if (existing.TryGetValue(raw.ExternalCode, out var user)) run.DuplicateCount++;
            else
            {
                user = new RawDeviceUser { AttendanceDeviceId = run.AttendanceDeviceId, ExternalCode = raw.ExternalCode };
                store.Add(user);
                existing[raw.ExternalCode] = user;
                run.InsertedCount++;
            }
            user.Name = RawAttendanceConversion.SafeName(raw.Name);
            user.SafeRawPayload = JsonSerializer.Serialize(new { raw.Privilege, raw.Enabled });
            user.PulledAtUtc = clock.GetUtcNow().UtcDateTime;
        }
    }
    private async Task StorePunchesAsync(DevicePullRun run, ConnectorPunchesResult result, CancellationToken ct)
    {
        run.ReadCount = result.ReadCount;
        run.SkippedCount = result.SkippedCount;
        run.InsertedCount = run.DuplicateCount = run.ErrorCount = 0;
        var zone = TimeZoneInfo.FindSystemTimeZoneById(run.AttendanceDevice.TimeZoneId);
        var keys = result.Punches.Select(x => RawAttendanceConversion.Key(run.AttendanceDevice.ProviderId, x)).Distinct().ToArray();
        var existing = new HashSet<string>(StringComparer.Ordinal);
        foreach (var batch in keys.Chunk(500))
            existing.UnionWith(await store.FindPunchKeysAsync(run.AttendanceDeviceId, batch, ct));
        foreach (var raw in result.Punches)
        {
            if (!RawAttendanceConversion.ValidCode(raw.ExternalCode) || raw.ProviderEventId?.Length > 256 ||
                !RawAttendanceConversion.TryUtc(raw.OccurredAtDeviceLocal, zone, out var utc))
            {
                run.SkippedCount++;
                continue;
            }
            if (run.FromUtc.HasValue && utc < run.FromUtc || run.ToUtc.HasValue && utc > run.ToUtc)
            {
                run.SkippedCount++;
                continue;
            }
            var key = RawAttendanceConversion.Key(run.AttendanceDevice.ProviderId, raw);
            if (!existing.Add(key)) { run.DuplicateCount++; continue; }
            store.Add(new RawAttendancePunch
            {
                AttendanceDeviceId = run.AttendanceDeviceId, ExternalCode = raw.ExternalCode,
                Name = RawAttendanceConversion.SafeName(raw.Name),
                OccurredAtDeviceLocal = DateTime.SpecifyKind(raw.OccurredAtDeviceLocal, DateTimeKind.Unspecified),
                OccurredAtUtc = utc, VerifyMode = raw.VerifyMode, InOutMode = raw.InOutMode, WorkCode = raw.WorkCode,
                ProviderEventId = raw.ProviderEventId, IdempotencyKey = key, PulledAtUtc = clock.GetUtcNow().UtcDateTime,
                SafeRawPayload = JsonSerializer.Serialize(new { raw.VerifyMode, raw.InOutMode, raw.WorkCode })
            });
            run.InsertedCount++;
        }
    }
    private async Task CompleteAsync(DevicePullRun run, CancellationToken ct)
    {
        run.Status = "completed";
        run.FinishedAtUtc = clock.GetUtcNow().UtcDateTime;
        run.AttendanceDevice.LastPullAtUtc = run.FinishedAtUtc;
        run.AttendanceDevice.LastSeenAtUtc = run.FinishedAtUtc;
        effects.Audit("PullCompleted", run.AttendanceDeviceId.ToString());
        await unitOfWork.SaveChangesAsync(ct);
    }
    private async Task FailAsync(DevicePullRun run, string code, CancellationToken ct)
    {
        run.Status = "failed";
        run.ErrorCount++;
        run.SafeError = code;
        run.FinishedAtUtc = clock.GetUtcNow().UtcDateTime;
        effects.Audit("PullFailed", run.AttendanceDeviceId.ToString(), false, code);
        await unitOfWork.SaveChangesAsync(ct);
        effects.Changed(run.AttendanceDeviceId);
    }
    private static DateOnly? ToDeviceDate(DateTime? utc, TimeZoneInfo zone) =>
        utc.HasValue ? DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(utc.Value, zone)) : null;

    private static string SafeCode(string code) =>
        code.Length is > 0 and <= 64 && code.All(x => char.IsAsciiLetterOrDigit(x) || x == '_')
            ? code : "CONNECTOR_OPERATION_FAILED";
}
