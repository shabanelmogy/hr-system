using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Contracts;
using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Services;

namespace HrManagementSystem.Infrastructure.Features.Platform.BackgroundJobs.Services;

public sealed class BackgroundJobDashboardService(JobStorage jobStorage)
    : IBackgroundJobDashboardService
{
    private readonly JobStorage _jobStorage = jobStorage;

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
            GeneratedAt: DateTimeOffset.UtcNow);
    }
}
