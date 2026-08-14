using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

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
