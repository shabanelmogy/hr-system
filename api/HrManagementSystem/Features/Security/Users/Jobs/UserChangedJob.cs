using HrManagementSystem.Features.Platform.Notifications.Services;

using HrManagementSystem.Features.Security.Users.Contracts;

namespace HrManagementSystem.Features.Security.Users.Jobs;

public sealed record UserChangedJobRequest(
    UserResponse User,
    string Action,
    string? ActorUserId,
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
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"User notification failed: {result.Error.Code}");

        var count = await context.Users.AsNoTracking().CountAsync(cancellationToken);
        await hubContext.Clients.All.ReceiveUserUpdate(
            Result.Success(new UserChangedResponse(count, request.User, request.Action)));
    }
}
