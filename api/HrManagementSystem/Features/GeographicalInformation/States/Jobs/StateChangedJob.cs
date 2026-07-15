using HrManagementSystem.Features.Platform.Notifications.Services;

using HrManagementSystem.Features.GeographicalInformation.States.Contracts;

using HrManagementSystem.Features.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.States.Jobs;

public sealed record StateChangedJobRequest(
    StateResponse State,
    string Action,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class StateChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext)
{
    public async Task ExecuteAsync(StateChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewStates,
            "GeographicalInformation",
            nameof(State),
            "States",
            request.Action,
            new Dictionary<string, string>
            {
                ["NameAr"] = request.State.NameAr,
                ["NameEn"] = request.State.NameEn
            },
            request.State.Id.ToString(CultureInfo.InvariantCulture),
            "/basic-data/states",
            request.ActorUserId,
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"State notification failed: {result.Error.Code}");

        var count = await context.States.AsNoTracking()
            .CountAsync(state => !state.IsDeleted, cancellationToken);

        await hubContext.Clients.All.ReceiveStateUpdate(
            new StatesCountResponse(count, request.State, request.Action));
    }
}
