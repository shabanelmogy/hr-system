using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Queries;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Abstractions;

public interface IWorkforceTraceReadStore
{
    Task<HiringTraceResponse?> GetTraceByApplicationAsync(int applicationId, bool includeFinancials, CancellationToken cancellationToken);
    Task<HiringTraceResponse?> GetTraceByOfferAsync(int offerId, bool includeFinancials, CancellationToken cancellationToken);
    Task<HiringTraceResponse?> GetTraceByEmployeeAsync(int employeeId, bool includeFinancials, CancellationToken cancellationToken);
    Task<PageResponse<PlanCommitmentRowResponse>> GetPlanCommitmentAsync(GetPlanCommitmentSummaryQuery query, bool includeFinancials, CancellationToken cancellationToken);
}

