namespace ErpSystem.Modules.Platform.Contracts.BackgroundJobs;

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

public interface IBackgroundJobDashboardService
{
    BackgroundJobDashboardResponse GetDashboard();
}

public sealed record BackgroundJobDashboardSessionCookie(
    string Name,
    string Value,
    DateTimeOffset Expires,
    string Path);

/// <summary>
/// Platform-facing contract for bridging an authenticated API token into the
/// scheduler dashboard session. Cookie mechanics are implemented by the host adapter.
/// </summary>
public interface IBackgroundJobDashboardSession
{
    string DashboardPath { get; }

    BackgroundJobDashboardSessionCookie CreateAccessTokenCookie(
        string accessToken,
        DateTimeOffset expiresAt);
}
