using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Application.Features.Attendance.Devices.Errors;
using HrManagementSystem.Domain.Attendance.Devices.Entities;
using MapsterMapper;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Commands;

public sealed record CreateAttendanceDeviceCommand(AttendanceDeviceRequest Request) : ICommand<Result<AttendanceDeviceResponse>>;
public sealed record UpdateAttendanceDeviceCommand(int Id, AttendanceDeviceRequest Request) : ICommand<Result<AttendanceDeviceResponse>>;
public sealed record SetAttendanceDeviceEnabledCommand(int Id, bool Enabled) : ICommand<Result>;
public sealed record CreateAttendanceAgentCommand(CreateAttendanceAgentRequest Request) : ICommand<Result<CreatedAttendanceAgentResponse>>;
public sealed record UpdateAttendanceDeviceCredentialsCommand(int Id, UpdateDeviceCredentialsRequest Request) : ICommand<Result>;
public sealed record DetectAttendanceDeviceCommand(DetectDeviceRequest Request) : ICommand<Result<DetectDeviceResponse>>;
public sealed record TestAttendanceDeviceCommand(int Id) : ICommand<Result<DeviceTestResponse>>;
public sealed record StartAttendanceDevicePullCommand(int Id, string OperationType, StartPullRequest Request) : ICommand<Result<PullRunResponse>>;

public sealed class CreateAttendanceDeviceCommandHandler(
    IAttendanceDeviceWriteStore store, IAttendanceDeviceReadStore reads, IUnitOfWork unitOfWork,
    IAttendanceNetworkPolicy network, AttendanceDeviceEffects effects, AttendanceDeviceErrors errors, IMapper mapper)
    : ICommandHandler<CreateAttendanceDeviceCommand, Result<AttendanceDeviceResponse>>
{
    public async Task<Result<AttendanceDeviceResponse>> Handle(CreateAttendanceDeviceCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<AttendanceDeviceResponse>(errors.Scope);
        if (!network.IsAllowed(request.Request.Host, request.Request.Port))
            return Result.Failure<AttendanceDeviceResponse>(errors.Host);
        var result = await unitOfWork.ExecuteAtomicallyAsync([effects.NameLock], async token =>
        {
            if (request.Request.BranchId is int branch && !await store.BranchIsActiveAsync(branch, token))
                return Result.Failure<AttendanceDeviceResponse>(errors.Branch);
            if (request.Request.AttendanceAgentId is Guid agentId && await store.FindAgentAsync(agentId, token) is not { IsActive: true })
                return Result.Failure<AttendanceDeviceResponse>(errors.Agent);
            var device = mapper.Map<AttendanceDevice>(request.Request);
            if (await store.NameExistsAsync(device.NormalizedName, null, token))
                return Result.Failure<AttendanceDeviceResponse>(errors.Duplicate);
            store.Add(device);
            // Stable caller-generated correlation; no host or secret appears in audit metadata.
            effects.Audit("Create", device.NormalizedName);
            await unitOfWork.SaveChangesAsync(token);
            return Result.Success((await reads.GetDeviceAsync(device.Id, token))!);
        }, ct);
        if (result.IsSuccess) effects.Changed(result.Value.Id);
        return result;
    }
}
public sealed class UpdateAttendanceDeviceCommandHandler(
    IAttendanceDeviceWriteStore store, IAttendanceDeviceReadStore reads, IUnitOfWork unitOfWork,
    IAttendanceNetworkPolicy network, AttendanceDeviceEffects effects, AttendanceDeviceErrors errors, IMapper mapper)
    : ICommandHandler<UpdateAttendanceDeviceCommand, Result<AttendanceDeviceResponse>>
{
    public async Task<Result<AttendanceDeviceResponse>> Handle(UpdateAttendanceDeviceCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<AttendanceDeviceResponse>(errors.Scope);
        if (!network.IsAllowed(request.Request.Host, request.Request.Port))
            return Result.Failure<AttendanceDeviceResponse>(errors.Host);
        var result = await unitOfWork.ExecuteAtomicallyAsync([effects.NameLock, effects.DeviceLock(request.Id)], async token =>
        {
            var device = await store.FindAsync(request.Id, token);
            if (device is null) return Result.Failure<AttendanceDeviceResponse>(errors.NotFound);
            if (await store.HasActivePullAsync(request.Id, token)) return Result.Failure<AttendanceDeviceResponse>(errors.Busy);
            if (request.Request.BranchId is int branch && !await store.BranchIsActiveAsync(branch, token))
                return Result.Failure<AttendanceDeviceResponse>(errors.Branch);
            if (request.Request.AttendanceAgentId is Guid agentId && await store.FindAgentAsync(agentId, token) is not { IsActive: true })
                return Result.Failure<AttendanceDeviceResponse>(errors.Agent);
            if (await store.NameExistsAsync(request.Request.Name.Trim().ToUpperInvariant(), request.Id, token))
                return Result.Failure<AttendanceDeviceResponse>(errors.Duplicate);
            mapper.Map(request.Request, device);
            effects.Audit("Update", request.Id.ToString());
            await unitOfWork.SaveChangesAsync(token);
            return Result.Success((await reads.GetDeviceAsync(request.Id, token))!);
        }, ct);
        if (result.IsSuccess) effects.Changed(request.Id);
        return result;
    }
}
public sealed class CreateAttendanceAgentCommandHandler(
    IAttendanceDeviceWriteStore store, IUnitOfWork unitOfWork, AttendanceDeviceEffects effects, AttendanceDeviceErrors errors,
    IAttendanceAgentInstallationSettings installationSettings)
    : ICommandHandler<CreateAttendanceAgentCommand, Result<CreatedAttendanceAgentResponse>>
{
    public async Task<Result<CreatedAttendanceAgentResponse>> Handle(CreateAttendanceAgentCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<CreatedAttendanceAgentResponse>(errors.Scope);
        var name = request.Request.Name.Trim();
        var normalized = name.ToUpperInvariant();
        var result = await unitOfWork.ExecuteAtomicallyAsync([effects.NameLock], async token =>
        {
            if (await store.AgentNameExistsAsync(normalized, token))
                return Result.Failure<CreatedAttendanceAgentResponse>(errors.AgentExists);
            var secret = $"hra_{ToBase64Url(RandomNumberGenerator.GetBytes(32))}";
            var agent = new AttendanceAgent
            {
                Id = Guid.NewGuid(), Name = name, NormalizedName = normalized,
                SecretHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
                SecretPrefix = secret[..Math.Min(secret.Length, 16)], IsActive = true
            };
            store.Add(agent);
            effects.Audit("CreateAgent", agent.Id.ToString());
            await unitOfWork.SaveChangesAsync(token);
            var summary = new AttendanceAgentResponse(agent.Id, agent.Name, agent.IsActive, agent.LastSeenAtUtc, 0);
            return Result.Success(new CreatedAttendanceAgentResponse(summary, secret,
                new AttendanceAgentInstallConfiguration(agent.Id, secret, installationSettings.HostedApiBaseUrl,
                    installationSettings.PollIntervalSeconds)));
        }, ct);
        if (result.IsSuccess) effects.ChangedAgents();
        return result;
    }

    private static string ToBase64Url(byte[] value) => Convert.ToBase64String(value)
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
public sealed class SetAttendanceDeviceEnabledCommandHandler(
    IAttendanceDeviceWriteStore store, IUnitOfWork unitOfWork, AttendanceDeviceEffects effects, AttendanceDeviceErrors errors)
    : ICommandHandler<SetAttendanceDeviceEnabledCommand, Result>
{
    public async Task<Result> Handle(SetAttendanceDeviceEnabledCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure(errors.Scope);
        var result = await unitOfWork.ExecuteAtomicallyAsync([effects.DeviceLock(request.Id)], async token =>
        {
            var device = await store.FindAsync(request.Id, token);
            if (device is null) return Result.Failure(errors.NotFound);
            if (await store.HasActivePullAsync(request.Id, token)) return Result.Failure(errors.Busy);
            device.Enabled = request.Enabled;
            effects.Audit(request.Enabled ? "Enable" : "Disable", request.Id.ToString());
            await unitOfWork.SaveChangesAsync(token);
            return Result.Success();
        }, ct);
        if (result.IsSuccess) effects.Changed(request.Id);
        return result;
    }
}
public sealed class UpdateAttendanceDeviceCredentialsCommandHandler(
    IAttendanceDeviceWriteStore store, IUnitOfWork unitOfWork, IAttendanceCredentialProtector protector,
    AttendanceDeviceEffects effects, AttendanceDeviceErrors errors)
    : ICommandHandler<UpdateAttendanceDeviceCredentialsCommand, Result>
{
    public async Task<Result> Handle(UpdateAttendanceDeviceCredentialsCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure(errors.Scope);
        var result = await unitOfWork.ExecuteAtomicallyAsync([effects.DeviceLock(request.Id)], async token =>
        {
            var device = await store.FindAsync(request.Id, token);
            if (device is null) return Result.Failure(errors.NotFound);
            if (device.ProviderId != "zkteco-com") return Result.Failure(errors.Provider);
            if (await store.HasActivePullAsync(request.Id, token)) return Result.Failure(errors.Busy);
            device.Credential ??= new DeviceCredential { AttendanceDevice = device };
            device.Credential.ProtectedPayload = protector.Protect(request.Request);
            effects.Audit("UpdateCredentials", request.Id.ToString());
            await unitOfWork.SaveChangesAsync(token);
            return Result.Success();
        }, ct);
        if (result.IsSuccess) effects.Changed(request.Id);
        return result;
    }
}
public sealed class DetectAttendanceDeviceCommandHandler(
    IAttendanceConnectorClient connector, IAttendanceNetworkPolicy network, IUnitOfWork unitOfWork,
    AttendanceDeviceEffects effects, AttendanceDeviceErrors errors)
    : ICommandHandler<DetectAttendanceDeviceCommand, Result<DetectDeviceResponse>>
{
    public async Task<Result<DetectDeviceResponse>> Handle(DetectAttendanceDeviceCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<DetectDeviceResponse>(errors.Scope);
        if (!network.IsAllowed(request.Request.Host, request.Request.Port))
            return Result.Failure<DetectDeviceResponse>(errors.Host);
        effects.Audit("DetectRequested", null);
        await unitOfWork.SaveChangesAsync(ct);
        var result = await connector.DetectAsync(request.Request, ct);
        effects.Audit("Detect", null, result.Detected);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Success(result);
    }
}
public sealed class TestAttendanceDeviceCommandHandler(
    IAttendanceDeviceWriteStore store, IAttendanceConnectorClient connector, IAttendanceNetworkPolicy network,
    IAttendanceCredentialProtector protector, IUnitOfWork unitOfWork, TimeProvider clock,
    AttendanceDeviceEffects effects, AttendanceDeviceErrors errors)
    : ICommandHandler<TestAttendanceDeviceCommand, Result<DeviceTestResponse>>
{
    public async Task<Result<DeviceTestResponse>> Handle(TestAttendanceDeviceCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<DeviceTestResponse>(errors.Scope);
        var device = await store.FindAsync(request.Id, ct);
        if (device is null) return Result.Failure<DeviceTestResponse>(errors.NotFound);
        if (!device.Enabled) return Result.Failure<DeviceTestResponse>(errors.Disabled);
        if (device.AttendanceAgentId.HasValue)
        {
            if (await store.HasActivePullAsync(request.Id, ct)) return Result.Failure<DeviceTestResponse>(errors.Busy);
            var run = new DevicePullRun
            {
                AttendanceDevice = device, OperationId = Guid.NewGuid(), OperationType = "test", Status = "pending",
                StartedAtUtc = clock.GetUtcNow().UtcDateTime
            };
            store.Add(run);
            effects.Audit("AgentTestQueued", request.Id.ToString());
            await unitOfWork.SaveChangesAsync(ct);
            effects.Changed(request.Id);
            return Result.Success(new DeviceTestResponse(false, null, null, null, null, "QUEUED", "Queued for the assigned site agent."));
        }
        if (!network.IsAllowed(device.Host, device.Port)) return Result.Failure<DeviceTestResponse>(errors.Host);
        UpdateDeviceCredentialsRequest? credentials;
        try { credentials = device.Credential is null ? null : protector.Unprotect(device.Credential.ProtectedPayload); }
        catch (System.Security.Cryptography.CryptographicException) { return Result.Failure<DeviceTestResponse>(errors.Credential); }
        effects.Audit("TestRequested", request.Id.ToString());
        await unitOfWork.SaveChangesAsync(ct);
        var result = await connector.TestAsync(new ConnectorEndpoint(device.Host, device.Port, device.ProviderId, credentials?.CommKey), ct);
        if (result.Connected) device.LastSeenAtUtc = clock.GetUtcNow().UtcDateTime;
        effects.Audit("Test", request.Id.ToString(), result.Connected, result.Error?.Code);
        await unitOfWork.SaveChangesAsync(ct);
        effects.Changed(request.Id);
        return Result.Success(new DeviceTestResponse(result.Connected, result.SerialNumber, result.FirmwareVersion,
            result.Platform, result.SdkVersion, result.Error?.Code, result.Error?.Message));
    }
}
public sealed class StartAttendanceDevicePullCommandHandler(
    IAttendanceDeviceWriteStore store, IUnitOfWork unitOfWork, IAttendancePullScheduler scheduler,
    IAttendanceNetworkPolicy network, ICurrentActor actor, TimeProvider clock,
    AttendanceDeviceEffects effects, AttendanceDeviceErrors errors, IMapper mapper,
    ILogger<StartAttendanceDevicePullCommandHandler> logger)
    : ICommandHandler<StartAttendanceDevicePullCommand, Result<PullRunResponse>>
{
    public async Task<Result<PullRunResponse>> Handle(StartAttendanceDevicePullCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<PullRunResponse>(errors.Scope);
        var operationId = request.Request.OperationId ?? Guid.NewGuid();
        var created = false;
        var assignedToSiteAgent = false;
        var result = await unitOfWork.ExecuteAtomicallyAsync([effects.DeviceLock(request.Id)], async token =>
        {
            var device = await store.FindAsync(request.Id, token);
            if (device is null) return Result.Failure<PullRunResponse>(errors.NotFound);
            assignedToSiteAgent = device.AttendanceAgentId.HasValue;
            var previous = await store.FindRunByOperationAsync(request.Id, operationId, token);
            if (previous is not null)
            {
                if (previous.OperationType != request.OperationType || previous.FromUtc != request.Request.FromUtc ||
                    previous.ToUtc != request.Request.ToUtc) return Result.Failure<PullRunResponse>(errors.OperationConflict);
                return Result.Success(mapper.Map<PullRunResponse>(previous));
            }
            if (!device.Enabled) return Result.Failure<PullRunResponse>(errors.Disabled);
            if (device.ProviderId != "zkteco-com") return Result.Failure<PullRunResponse>(errors.Provider);
            // An assigned site agent reaches the device locally. Only unassigned legacy devices use the server-side connector policy.
            if (!device.AttendanceAgentId.HasValue && !network.IsAllowed(device.Host, device.Port)) return Result.Failure<PullRunResponse>(errors.Host);
            if (await store.HasActivePullAsync(request.Id, token)) return Result.Failure<PullRunResponse>(errors.Busy);
            var run = new DevicePullRun
            {
                AttendanceDevice = device, OperationId = operationId, OperationType = request.OperationType,
                Status = "pending", StartedAtUtc = clock.GetUtcNow().UtcDateTime,
                FromUtc = request.Request.FromUtc, ToUtc = request.Request.ToUtc
            };
            store.Add(run);
            effects.Audit(request.OperationType == "users" ? "PullUsers" : "PullAttendance", request.Id.ToString());
            await unitOfWork.SaveChangesAsync(token);
            created = true;
            return Result.Success(mapper.Map<PullRunResponse>(run));
        }, ct);
        if (result.IsSuccess && !result.Value.Status.Equals("pending", StringComparison.Ordinal)) return result;
        if (result.IsSuccess && (created || result.Value.Status == "pending") && !assignedToSiteAgent)
        {
            try { scheduler.Schedule(new AttendancePullJobRequest(result.Value.Id, actor.UserId!, actor.TenantId!, actor.CompanyId!.Value)); }
            catch (Exception)
            {
                // Pending run is a durable outbox. Recovery dispatcher will enqueue it again.
                logger.LogWarning("Attendance pull {RunId} persisted; background enqueue deferred to recovery.", result.Value.Id);
            }
            effects.Changed(request.Id);
        }
        return result;
    }
}
