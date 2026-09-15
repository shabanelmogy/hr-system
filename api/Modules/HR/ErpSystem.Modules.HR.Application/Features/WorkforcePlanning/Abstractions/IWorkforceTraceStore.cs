using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;

public interface IWorkforceTraceReadStore
{
    Task<HiringTraceResponse?> GetTraceByApplicationAsync(int applicationId, bool includeFinancials, CancellationToken cancellationToken);
    Task<HiringTraceResponse?> GetTraceByOfferAsync(int offerId, bool includeFinancials, CancellationToken cancellationToken);
    Task<HiringTraceResponse?> GetTraceByEmployeeAsync(int employeeId, bool includeFinancials, CancellationToken cancellationToken);
    Task<PageResponse<PlanCommitmentRowResponse>> GetPlanCommitmentAsync(GetPlanCommitmentSummaryQuery query, bool includeFinancials, CancellationToken cancellationToken);
}

