namespace HrManagementSystem.Application.Features.Platform.BackgroundJobs.Contracts;

public sealed record BackgroundJobDashboardResponse(
    int Servers,
    int Queues,
    long Enqueued,
    long Scheduled,
    long Processing,
    long Succeeded,
    long Failed,
    DateTimeOffset GeneratedAt);
