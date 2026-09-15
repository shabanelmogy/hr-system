using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;

using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Domain.Tenancy.Entities;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Jobs;

public sealed record UserChangedJobRequest(
    UserResponse User,
    string Action,
    string? ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class UserChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(UserChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            PlatformPermissions.ViewUsers,
            "Security",
            "User",
            "Users",
            request.Action,
            new Dictionary<string, string>
            {
                ["UserName"] = request.User.UserName,
                ["FullName"] = $"{request.User.FirstName} {request.User.LastName}".Trim()
            },
            request.User.Id,
            "/administration/users",
            request.ActorUserId,
            request.OperationId,
            request.TenantId,
            request.CompanyId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"User notification failed: {result.Error.Code}");

        await Task.WhenAll(
            realtimePublisher.PublishAsync(RealtimeChangeRequest.For<PlatformApplicationUser>(
                RealtimeAudience.ForCompanyPermission(
                    request.TenantId,
                    request.CompanyId,
                    PlatformPermissions.ViewUsers),
                request.Action,
                request.User.Id,
                request.OperationId), cancellationToken),
            realtimePublisher.PublishAsync(RealtimeChangeRequest.For<Tenant>(
                RealtimeAudience.ForRole(PlatformRoleNames.SuperAdmin),
                "UserCountChanged",
                request.TenantId), cancellationToken));
    }
}
