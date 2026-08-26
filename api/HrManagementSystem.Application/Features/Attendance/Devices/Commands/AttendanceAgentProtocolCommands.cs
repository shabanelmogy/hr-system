using System.Text.Json;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Application.Features.Attendance.Devices.Errors;
using HrManagementSystem.Domain.Attendance.Devices.Entities;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Commands;

/// <summary>Commands reached only after the API has authenticated the enrollment token and established its company scope.</summary>
public sealed record HeartbeatAttendanceAgentCommand(Guid AgentId) : ICommand<Result<AttendanceAgentHeartbeatResponse>>;
public sealed record ClaimAttendanceAgentWorkCommand(Guid AgentId) : ICommand<Result<AttendanceAgentWorkItemResponse?>>;
public sealed record SubmitAttendanceAgentWorkResultCommand(Guid AgentId, long RunId, SubmitAttendanceAgentWorkResultRequest Result)
    : ICommand<Result<AttendanceAgentWorkResultResponse>>;

public sealed class HeartbeatAttendanceAgentCommandHandler(
    IAttendanceDeviceWriteStore store, IUnitOfWork unitOfWork, TimeProvider clock, AttendanceDeviceErrors errors)
    : ICommandHandler<HeartbeatAttendanceAgentCommand, Result<AttendanceAgentHeartbeatResponse>>
{
    public async Task<Result<AttendanceAgentHeartbeatResponse>> Handle(HeartbeatAttendanceAgentCommand request, CancellationToken ct)
    {
        var agent = await store.FindAgentAsync(request.AgentId, ct);
        if (agent is not { IsActive: true }) return Result.Failure<AttendanceAgentHeartbeatResponse>(errors.Agent);
        var now = clock.GetUtcNow().UtcDateTime;
        agent.LastSeenAtUtc = now;
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Success(new AttendanceAgentHeartbeatResponse(now));
    }
}

public sealed class ClaimAttendanceAgentWorkCommandHandler(
    IAttendanceDeviceWriteStore devices, IAttendanceRawStore raw, IAttendanceCredentialProtector protector,
    IUnitOfWork unitOfWork, TimeProvider clock, AttendanceDeviceEffects effects, AttendanceDeviceErrors errors)
    : ICommandHandler<ClaimAttendanceAgentWorkCommand, Result<AttendanceAgentWorkItemResponse?>>
{
    private static readonly TimeSpan LeaseDuration = TimeSpan.FromMinutes(5);

    public async Task<Result<AttendanceAgentWorkItemResponse?>> Handle(ClaimAttendanceAgentWorkCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<AttendanceAgentWorkItemResponse?>(errors.Scope);
        var now = clock.GetUtcNow().UtcDateTime;
        return await unitOfWork.ExecuteAtomicallyAsync([effects.AgentLock(request.AgentId)], async token =>
        {
            var agent = await devices.FindAgentAsync(request.AgentId, token);
            if (agent is not { IsActive: true }) return Result.Failure<AttendanceAgentWorkItemResponse?>(errors.Agent);
            agent.LastSeenAtUtc = now;
            var run = await raw.FindClaimableRunAsync(request.AgentId, now, token);
            if (run is null)
            {
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success<AttendanceAgentWorkItemResponse?>(null);
            }

            UpdateDeviceCredentialsRequest? credential;
            try { credential = run.AttendanceDevice.Credential is null ? null : protector.Unprotect(run.AttendanceDevice.Credential.ProtectedPayload); }
            catch (System.Security.Cryptography.CryptographicException) { return Result.Failure<AttendanceAgentWorkItemResponse?>(errors.Credential); }
            run.Status = "running";
            run.ClaimedByAttendanceAgentId = request.AgentId;
            run.LeaseExpiresAtUtc = now.Add(LeaseDuration);
            run.AttemptCount++;
            run.SafeError = null;
            await unitOfWork.SaveChangesAsync(token);
            return Result.Success<AttendanceAgentWorkItemResponse?>(new AttendanceAgentWorkItemResponse(run.Id, run.OperationType,
                run.AttendanceDeviceId, run.AttendanceDevice.ProviderId, run.AttendanceDevice.Host, run.AttendanceDevice.Port,
                run.AttendanceDevice.TimeZoneId, credential?.CommKey, run.FromUtc, run.ToUtc, run.LeaseExpiresAtUtc.Value));
        }, ct);
    }
}

public sealed class SubmitAttendanceAgentWorkResultCommandHandler(
    IAttendanceRawStore raw, IUnitOfWork unitOfWork, TimeProvider clock, AttendanceDeviceEffects effects, AttendanceDeviceErrors errors)
    : ICommandHandler<SubmitAttendanceAgentWorkResultCommand, Result<AttendanceAgentWorkResultResponse>>
{
    public async Task<Result<AttendanceAgentWorkResultResponse>> Handle(SubmitAttendanceAgentWorkResultCommand request, CancellationToken ct)
    {
        if (!effects.HasScope) return Result.Failure<AttendanceAgentWorkResultResponse>(errors.Scope);
        var run = await raw.FindRunAsync(request.RunId, ct);
        if (run is null || run.AttendanceDevice.AttendanceAgentId != request.AgentId) return Result.Failure<AttendanceAgentWorkResultResponse>(errors.NotFound);
        if (run.Status is "completed" or "failed") return Result.Success(Response(run));
        if (run.Status != "running" || run.ClaimedByAttendanceAgentId != request.AgentId || run.LeaseExpiresAtUtc < clock.GetUtcNow().UtcDateTime)
            return Result.Failure<AttendanceAgentWorkResultResponse>(errors.AgentLease);

        return await unitOfWork.ExecuteAtomicallyAsync([effects.DeviceLock(run.AttendanceDeviceId)], async token =>
        {
            // Re-read inside the device lock so a duplicate HTTP retry cannot insert a second set of raw records.
            run = await raw.FindRunAsync(request.RunId, token);
            if (run is null || run.AttendanceDevice.AttendanceAgentId != request.AgentId) return Result.Failure<AttendanceAgentWorkResultResponse>(errors.NotFound);
            if (run.Status is "completed" or "failed") return Result.Success(Response(run));
            if (run.Status != "running" || run.ClaimedByAttendanceAgentId != request.AgentId || run.LeaseExpiresAtUtc < clock.GetUtcNow().UtcDateTime)
                return Result.Failure<AttendanceAgentWorkResultResponse>(errors.AgentLease);

            if (!request.Result.Succeeded)
            {
                Fail(run, request.Result.ErrorCode, clock);
                await unitOfWork.SaveChangesAsync(token);
                effects.Changed(run.AttendanceDeviceId);
                return Result.Success(Response(run));
            }

            if (run.OperationType == "users") await StoreUsersAsync(run, request.Result, raw, clock, token);
            else if (run.OperationType == "attendance") await StorePunchesAsync(run, request.Result, raw, clock, token);
            else if (run.OperationType == "test") StoreTest(run, request.Result, clock);
            else { Fail(run, "UNSUPPORTED_OPERATION", clock); await unitOfWork.SaveChangesAsync(token); return Result.Success(Response(run)); }

            if (run.Status == "failed")
            {
                await unitOfWork.SaveChangesAsync(token);
                effects.Changed(run.AttendanceDeviceId);
                return Result.Success(Response(run));
            }

            run.Status = "completed";
            run.FinishedAtUtc = clock.GetUtcNow().UtcDateTime;
            run.LeaseExpiresAtUtc = null;
            run.AttendanceDevice.LastPullAtUtc = run.FinishedAtUtc;
            if (run.OperationType != "test" || request.Result.Test?.Connected == true) run.AttendanceDevice.LastSeenAtUtc = run.FinishedAtUtc;
            effects.Audit("AgentPullCompleted", run.AttendanceDeviceId.ToString());
            await unitOfWork.SaveChangesAsync(token);
            effects.Changed(run.AttendanceDeviceId);
            return Result.Success(Response(run));
        }, ct);
    }

    private static async Task StoreUsersAsync(DevicePullRun run, SubmitAttendanceAgentWorkResultRequest result, IAttendanceRawStore store, TimeProvider clock, CancellationToken ct)
    {
        var users = result.Users ?? [];
        run.ReadCount = Math.Max(result.ReadCount, users.Count);
        run.SkippedCount = Math.Max(0, result.SkippedCount);
        run.InsertedCount = run.DuplicateCount = run.ErrorCount = 0;
        var codes = users.Where(x => RawAttendanceConversion.ValidCode(x.ExternalCode)).Select(x => x.ExternalCode).Distinct(StringComparer.Ordinal).ToArray();
        var existing = new Dictionary<string, RawDeviceUser>(StringComparer.Ordinal);
        foreach (var batch in codes.Chunk(500)) foreach (var item in await store.FindUsersAsync(run.AttendanceDeviceId, batch, ct)) existing[item.ExternalCode] = item;
        foreach (var item in users)
        {
            if (!RawAttendanceConversion.ValidCode(item.ExternalCode)) { run.SkippedCount++; continue; }
            if (!existing.TryGetValue(item.ExternalCode, out var user))
            {
                user = new RawDeviceUser { AttendanceDeviceId = run.AttendanceDeviceId, ExternalCode = item.ExternalCode };
                store.Add(user); existing[item.ExternalCode] = user; run.InsertedCount++;
            }
            else run.DuplicateCount++;
            user.Name = RawAttendanceConversion.SafeName(item.Name);
            user.SafeRawPayload = JsonSerializer.Serialize(new { item.Privilege, item.Enabled });
            user.PulledAtUtc = clock.GetUtcNow().UtcDateTime;
        }
    }

    private static async Task StorePunchesAsync(DevicePullRun run, SubmitAttendanceAgentWorkResultRequest result, IAttendanceRawStore store, TimeProvider clock, CancellationToken ct)
    {
        var punches = result.Punches ?? [];
        run.ReadCount = Math.Max(result.ReadCount, punches.Count);
        run.SkippedCount = Math.Max(0, result.SkippedCount);
        run.InsertedCount = run.DuplicateCount = run.ErrorCount = 0;
        TimeZoneInfo zone;
        try { zone = TimeZoneInfo.FindSystemTimeZoneById(run.AttendanceDevice.TimeZoneId); }
        catch (TimeZoneNotFoundException) { Fail(run, "TIME_ZONE_UNAVAILABLE", clock); return; }
        var keys = punches.Select(x => RawAttendanceConversion.Key(run.AttendanceDevice.ProviderId,
            new ConnectorPunch(x.ExternalCode, x.Name, x.OccurredAtDeviceLocal, x.VerifyMode, x.InOutMode, x.WorkCode, x.ProviderEventId))).Distinct().ToArray();
        var existing = new HashSet<string>(StringComparer.Ordinal);
        foreach (var batch in keys.Chunk(500)) existing.UnionWith(await store.FindPunchKeysAsync(run.AttendanceDeviceId, batch, ct));
        foreach (var item in punches)
        {
            var connector = new ConnectorPunch(item.ExternalCode, item.Name, item.OccurredAtDeviceLocal, item.VerifyMode, item.InOutMode, item.WorkCode, item.ProviderEventId);
            if (!RawAttendanceConversion.ValidCode(item.ExternalCode) || item.ProviderEventId?.Length > 256 || !RawAttendanceConversion.TryUtc(item.OccurredAtDeviceLocal, zone, out var utc)) { run.SkippedCount++; continue; }
            if ((run.FromUtc.HasValue && utc < run.FromUtc) || (run.ToUtc.HasValue && utc > run.ToUtc)) { run.SkippedCount++; continue; }
            var key = RawAttendanceConversion.Key(run.AttendanceDevice.ProviderId, connector);
            if (!existing.Add(key)) { run.DuplicateCount++; continue; }
            store.Add(new RawAttendancePunch { AttendanceDeviceId = run.AttendanceDeviceId, ExternalCode = item.ExternalCode, Name = RawAttendanceConversion.SafeName(item.Name),
                OccurredAtDeviceLocal = DateTime.SpecifyKind(item.OccurredAtDeviceLocal, DateTimeKind.Unspecified), OccurredAtUtc = utc,
                VerifyMode = item.VerifyMode, InOutMode = item.InOutMode, WorkCode = item.WorkCode, ProviderEventId = item.ProviderEventId,
                IdempotencyKey = key, PulledAtUtc = clock.GetUtcNow().UtcDateTime,
                SafeRawPayload = JsonSerializer.Serialize(new { item.VerifyMode, item.InOutMode, item.WorkCode }) });
            run.InsertedCount++;
        }
    }

    private static void StoreTest(DevicePullRun run, SubmitAttendanceAgentWorkResultRequest result, TimeProvider clock)
    {
        if (result.Test is not { Connected: true }) { Fail(run, result.Test?.ErrorCode ?? "DEVICE_TEST_FAILED", clock); return; }
        run.ReadCount = 1; run.InsertedCount = run.DuplicateCount = run.SkippedCount = run.ErrorCount = 0;
    }
    private static void Fail(DevicePullRun run, string? code, TimeProvider clock)
    {
        run.Status = "failed"; run.ErrorCount++; run.SafeError = SafeCode(code); run.FinishedAtUtc = clock.GetUtcNow().UtcDateTime; run.LeaseExpiresAtUtc = null;
    }
    private static string SafeCode(string? code) => !string.IsNullOrWhiteSpace(code) && code.Length <= 64 && code.All(x => char.IsAsciiLetterOrDigit(x) || x == '_') ? code : "AGENT_OPERATION_FAILED";
    private static AttendanceAgentWorkResultResponse Response(DevicePullRun run) => new(run.Id, run.Status, run.InsertedCount, run.DuplicateCount, run.SkippedCount, run.ErrorCount);
}
