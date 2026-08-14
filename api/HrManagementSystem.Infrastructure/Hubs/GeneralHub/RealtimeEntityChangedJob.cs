using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class RealtimeEntityChangedJob(IRealtimeEntityPublisher publisher)
{
    public Task ExecuteAsync(
        RealtimeChangeRequest request,
        CancellationToken cancellationToken) =>
        publisher.PublishAsync(request, cancellationToken);
}
