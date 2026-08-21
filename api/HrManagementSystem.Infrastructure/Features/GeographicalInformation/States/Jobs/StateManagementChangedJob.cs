using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class StateManagementChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(StateChange request, CancellationToken cancellationToken)
    {
        var parameters = request.State is null
            ? new Dictionary<string, string> { ["Count"] = (request.BulkCount ?? 0).ToString(CultureInfo.InvariantCulture) }
            : new Dictionary<string, string> { ["NameAr"] = request.State.NameAr, ["NameEn"] = request.State.NameEn };
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewStates,
            "GeographicalInformation",
            nameof(State),
            "States",
            request.Action,
            parameters,
            request.State?.Id.ToString(CultureInfo.InvariantCulture),
            "/basic-data/states",
            request.ActorUserId,
            request.OperationId);
        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"State notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<State>(
            RealtimeAudience.ForPermission(Permissions.ViewStates),
            request.Action,
            request.State?.Id.ToString(CultureInfo.InvariantCulture),
            request.OperationId), cancellationToken);
    }
}

public sealed class StateChangeScheduler : IStateChangeScheduler
{
    public void Schedule(StateChange change) =>
        BackgroundJob.Enqueue<StateManagementChangedJob>(job => job.ExecuteAsync(change, CancellationToken.None));
}
