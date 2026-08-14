namespace HrManagementSystem.Application.Common.Realtime;

/// <summary>
/// Schedules a transient cache-invalidation event after a mutation has committed.
/// This is deliberately separate from persisted user notifications.
/// </summary>
public interface IRealtimeChangeDispatcher
{
    void Dispatch(RealtimeChangeRequest request);
}

public interface IRealtimeEntityPublisher
{
    Task PublishAsync(
        RealtimeChangeRequest request,
        CancellationToken cancellationToken = default);
}
