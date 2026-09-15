using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;

public sealed record GetRecruitmentDashboardSummaryQuery
    : IQuery<RecruitmentDashboardSummaryDto>;

public sealed class GetRecruitmentDashboardSummaryQueryHandler(
    IRecruitmentDashboardReadStore readStore)
    : IQueryHandler<GetRecruitmentDashboardSummaryQuery, RecruitmentDashboardSummaryDto>
{
    public Task<RecruitmentDashboardSummaryDto> Handle(
        GetRecruitmentDashboardSummaryQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetSummaryAsync(cancellationToken);
}
