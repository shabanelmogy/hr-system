using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Common.Realtime;

using HrManagementSystem.Application.Features.Security.Users.Contracts;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Domain.Tenancy.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Users.Jobs;

public sealed record UserChangedJobRequest(
    UserResponse User,
    string Action,
    string? ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class UserChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext)
{
    public async Task ExecuteAsync(UserChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewUsers,
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

        var count = await context.Users.IgnoreQueryFilters().AsNoTracking()
            .CountAsync(user => user.TenantId == request.TenantId, cancellationToken);
        var clients = hubContext.Clients.Group(GeneralHubGroups.ForCompanyPermission(
            request.TenantId,
            request.CompanyId,
            Permissions.ViewUsers));

        var superAdminClients = hubContext.Clients.Group(
            GeneralHubGroups.ForRole(AppRoles.super_admin));

        await Task.WhenAll(
            clients.ReceiveUserUpdate(
                Result.Success(new UserChangedResponse(count, request.User, request.Action))),
            clients.ReceiveEntityChanged(new RealtimeEntityChanged(
                request.OperationId,
                DateTime.UtcNow,
                RealtimeResource.For<ApplicationUser>(),
                request.Action,
                request.User.Id)),
            superAdminClients.ReceiveEntityChanged(new RealtimeEntityChanged(
                Guid.NewGuid(),
                DateTime.UtcNow,
                RealtimeResource.For<Tenant>(),
                "UserCountChanged",
                request.TenantId)));
    }
}
