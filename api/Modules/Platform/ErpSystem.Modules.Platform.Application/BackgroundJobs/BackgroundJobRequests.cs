namespace ErpSystem.Modules.Platform.Application.BackgroundJobs;

public sealed record GetBackgroundJobDashboardQuery : IQuery<BackgroundJobDashboardResponse>;

public sealed class GetBackgroundJobDashboardQueryHandler(IBackgroundJobDashboardReader reader)
    : IQueryHandler<GetBackgroundJobDashboardQuery, BackgroundJobDashboardResponse>
{
    public Task<BackgroundJobDashboardResponse> Handle(
        GetBackgroundJobDashboardQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(reader.GetDashboard());
}
