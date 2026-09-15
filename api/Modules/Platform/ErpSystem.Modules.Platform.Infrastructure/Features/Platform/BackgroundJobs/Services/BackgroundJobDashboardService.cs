using ErpSystem.Modules.Platform.Application.BackgroundJobs;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.BackgroundJobs.Services;

public sealed class BackgroundJobDashboardReader(JobStorage jobStorage, TimeProvider timeProvider)
    : IBackgroundJobDashboardReader
{
    private readonly JobStorage _jobStorage = jobStorage;
    private readonly TimeProvider _timeProvider = timeProvider;

    public BackgroundJobDashboardResponse GetDashboard()
    {
        var monitoring = _jobStorage.GetMonitoringApi();
        var queues = monitoring.Queues();

        return new BackgroundJobDashboardResponse(
            Servers: monitoring.Servers().Count,
            Queues: queues.Count,
            Enqueued: queues.Sum(queue => monitoring.EnqueuedCount(queue.Name)),
            Scheduled: monitoring.ScheduledCount(),
            Processing: monitoring.ProcessingCount(),
            Succeeded: monitoring.SucceededListCount(),
            Failed: monitoring.FailedCount(),
            GeneratedAt: _timeProvider.GetUtcNow());
    }
}
