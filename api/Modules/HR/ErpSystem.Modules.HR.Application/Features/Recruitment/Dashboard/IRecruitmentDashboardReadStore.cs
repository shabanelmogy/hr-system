using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;

public interface IRecruitmentDashboardReadStore
{
    Task<RecruitmentDashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken);
}
