using ErpSystem.BuildingBlocks.Application.Common.Realtime;

namespace ErpSystem.Modules.Platform.Infrastructure.Realtime;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class RealtimeEntityChangedJob(IRealtimeEntityPublisher publisher)
{
    public Task ExecuteAsync(
        RealtimeChangeRequest request,
        CancellationToken cancellationToken) =>
        publisher.PublishAsync(request, cancellationToken);
}
