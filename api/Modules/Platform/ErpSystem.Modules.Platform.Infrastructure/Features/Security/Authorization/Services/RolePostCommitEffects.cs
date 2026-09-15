using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;

public sealed class RolePostCommitEffects(
    IRealtimeChangeDispatcher realtimeChanges,
    SessionRevocationNotifier revocationNotifier,
    ILogger<RolePostCommitEffects> logger) : IRolePostCommitEffects
{
    public void PublishRoleChanged(string tenantId, string roleId, string action) =>
        TryRun(
            $"RoleChanged.{action}.Realtime",
            () => realtimeChanges.Dispatch(RealtimeChangeRequest.For<PlatformApplicationRole>(
                RealtimeAudience.ForTenantPermission(tenantId, PlatformPermissions.ViewRoles),
                action,
                roleId)));

    public void PublishRoleClaimsChanged(string tenantId, string roleId)
    {
        TryRun(
            "RolePermissionsUpdated.Realtime",
            () => realtimeChanges.Dispatch(RealtimeChangeRequest.For<PlatformApplicationRole>(
                RealtimeAudience.ForTenantPermission(tenantId, PlatformPermissions.ViewRoles),
                "PermissionsChanged",
                roleId)));

        var eventId = Guid.NewGuid();
        TryRun(
            "RolePermissionsUpdated.TenantRealtime",
            () => realtimeChanges.Dispatch(new RealtimeChangeRequest(
                RealtimeAudience.ForTenantPermission(tenantId, PlatformPermissions.ViewRoles),
                "role-claims",
                "Update",
                roleId,
                eventId)));
        TryRun(
            "RolePermissionsUpdated.RoleRealtime",
            () => realtimeChanges.Dispatch(new RealtimeChangeRequest(
                RealtimeAudience.ForTenantRole(tenantId, roleId),
                "role-claims",
                "Update",
                roleId,
                eventId)));
    }

    public void QueueSessionRevocations(
        IReadOnlyCollection<string> userIds,
        string notificationMessage)
    {
        foreach (var userId in userIds)
        {
            TryRun(
                "SessionRevocation.Hangfire",
                () => revocationNotifier.Queue(userId, notificationMessage));
        }
    }

    private void TryRun(string effectName, Action action)
    {
        try
        {
            action();
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Post-commit role side effect failed. Effect={EffectName}",
                effectName);
        }
    }
}
