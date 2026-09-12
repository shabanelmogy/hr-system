using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.HR.Application.Common.Realtime;

using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.States.Contracts;

using ErpSystem.Modules.HR.Domain.GeographicalInformation.States.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.States.Jobs;

public sealed record StateChangedJobRequest(
    StateResponse State,
    string Action,
    string? ActorUserId,
    Guid OperationId);

// Compatibility executor for State jobs persisted before the CQRS migration.
// Current runtime code schedules StateManagementChangedJob instead.
[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class StateChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    IRealtimeEntityPublisher realtimePublisher)
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
            "/super-admin/geography/states",
            request.ActorUserId,
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"State notification failed: {result.Error.Code}");

        var count = await context.States.AsNoTracking()
            .CountAsync(state => !state.IsDeleted, cancellationToken);

        var clients = hubContext.Clients.Group(
            GeneralHubGroups.ForPermission(Permissions.ViewStates));

        await Task.WhenAll(
            clients.ReceiveStateUpdate(
                new StatesCountResponse(count, request.State, request.Action)),
            realtimePublisher.PublishAsync(RealtimeChangeRequest.For<State>(
                RealtimeAudience.ForPermission(Permissions.ViewStates),
                request.Action,
                request.State.Id.ToString(CultureInfo.InvariantCulture),
                request.OperationId), cancellationToken));
    }
}
