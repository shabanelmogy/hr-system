namespace ErpSystem.Modules.Platform.Application.BackgroundJobs;

/// <summary>
/// Provider-neutral snapshot used by the platform background-job dashboard.
/// The concrete scheduler/monitor implementation remains an infrastructure concern.
/// </summary>
public sealed record BackgroundJobDashboardResponse(
    int Servers,
    int Queues,
    long Enqueued,
    long Scheduled,
    long Processing,
    long Succeeded,
    long Failed,
    DateTimeOffset GeneratedAt);

public interface IBackgroundJobDashboardReader
{
    BackgroundJobDashboardResponse GetDashboard();
}
