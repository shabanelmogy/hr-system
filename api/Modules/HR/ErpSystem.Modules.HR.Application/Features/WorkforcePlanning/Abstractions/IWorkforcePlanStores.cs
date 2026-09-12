using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;

public interface IWorkforcePlanReadStore
{
    Task<PageResponse<WorkforcePlanListItemResponse>> GetPageAsync(GetWorkforcePlansQuery query, CancellationToken cancellationToken);
    Task<WorkforcePlanDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<WorkforcePlanDetailResponse>> GetRevisionsAsync(int id, CancellationToken cancellationToken);
}

public interface IWorkforcePlanWriteStore
{
    void Add(WorkforcePlan plan);
    Task<WorkforcePlan?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string planCode, int fiscalYearId, int? excludedId, CancellationToken cancellationToken);
    Task<FiscalYearPlanningSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken);
    Task<PositionPlanningSnapshot?> GetPositionAsync(int positionId, CancellationToken cancellationToken);
    Task<bool> IsBranchAvailableAsync(int branchId, CancellationToken cancellationToken);
    Task<int> GetBaselineHeadcountAsync(int positionId, int? branchId, DateOnly asOfDate, CancellationToken cancellationToken);
    void RemovePeriodTargets(IReadOnlyCollection<WorkforcePlanLinePeriodTarget> targets);
    void RemoveLines(IReadOnlyCollection<WorkforcePlanLine> lines);
    void ApplyRowVersion(WorkforcePlan plan, string rowVersion);
}

public sealed record FiscalYearPlanningSnapshot(
    int Id,
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlySet<int> PeriodIds,
    string Status);

public sealed record PositionPlanningSnapshot(
    int Id,
    int DivisionId,
    int DepartmentId,
    int? DepartmentBranchId);
