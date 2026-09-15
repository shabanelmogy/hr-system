using ErpSystem.BuildingBlocks.Application.Common.Realtime;

namespace ErpSystem.Modules.Platform.Infrastructure.Realtime;

public sealed class HangfireRealtimeChangeDispatcher(IBackgroundJobClient jobs)
    : IRealtimeChangeDispatcher
{
    public void Dispatch(RealtimeChangeRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        jobs.Enqueue<RealtimeEntityChangedJob>(job =>
            job.ExecuteAsync(request, CancellationToken.None));
    }
}
