using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Domain.Platform.SecurityAudits.Enums;
using Microsoft.Extensions.Logging;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Commands;

/// <summary>Shared audit/invalidation side effects only; handlers own mutations and transactions.</summary>
public sealed class AttendanceDeviceEffects(
    ICurrentActor actor, ISecurityAuditService audit, IRealtimeChangeDispatcher realtime,
    ILogger<AttendanceDeviceEffects> logger)
{
    public bool HasScope => !string.IsNullOrWhiteSpace(actor.UserId) &&
        !string.IsNullOrWhiteSpace(actor.TenantId) && actor.CompanyId is > 0;
    public string DeviceLock(int id) => $"attendance:{actor.TenantId}:{actor.CompanyId}:device:{id}";
    public string NameLock => $"attendance:{actor.TenantId}:{actor.CompanyId}:names";
    public string AgentLock(Guid agentId) => $"attendance:{actor.TenantId}:{actor.CompanyId}:agent:{agentId}";

    public void Audit(string action, string? targetId, bool succeeded = true, string? reason = null) =>
        audit.Add(new SecurityAuditRequest($"AttendanceDevice.{action}", "AttendanceDevice", targetId,
            succeeded ? SecurityAuditOutcome.Succeeded : SecurityAuditOutcome.Failed, Reason: reason));

    public void Changed(int deviceId)
    {
        try
        {
            foreach (var permission in new[] { Permissions.ViewAttendanceDevices, Permissions.ViewRawAttendanceDevices })
                realtime.Dispatch(new RealtimeChangeRequest(
                    RealtimeAudience.ForCompanyPermission(actor.TenantId!, actor.CompanyId!.Value, permission),
                    "attendance-devices", "Refresh", deviceId.ToString(CultureInfo.InvariantCulture), Guid.NewGuid()));
        }
        catch (Exception)
        {
            // The mutation is already committed. Do not tell the client to retry a successful write.
            logger.LogWarning("Attendance device saved, but realtime invalidation could not be queued.");
        }
    }

    public void ChangedAgents() => Changed(0);
}
