using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Queries;
using HrManagementSystem.Domain.WorkforcePlanning.Entities;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Abstractions;

public interface IWorkforceBudgetReadStore
{
    Task<PageResponse<WorkforceBudgetListItemResponse>> GetPageAsync(GetWorkforceBudgetsQuery query, CancellationToken cancellationToken);
    Task<WorkforceBudgetDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<PageResponse<BudgetSourcePlanResponse>> GetSourcePlansAsync(GetBudgetSourcePlansQuery query, CancellationToken cancellationToken);
    Task<BudgetSourcePlanResponse?> GetSourcePlanByIdAsync(int planId, CancellationToken cancellationToken);
    Task<PageResponse<PositionEnvelopeListItemResponse>> GetEnvelopesAsync(GetPositionEnvelopesQuery query, CancellationToken cancellationToken);
    Task<PositionEnvelopeDetailResponse?> GetEnvelopeByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IWorkforceBudgetWriteStore
{
    void Add(WorkforceBudget budget);
    void AddEnvelope(PositionEnvelope envelope);
    Task<WorkforceBudget?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string budgetCode, int fiscalYearId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> BudgetExistsForPlanAsync(int workforcePlanId, int? excludedId, CancellationToken cancellationToken);
    Task<BudgetPlanSnapshot?> GetPlanAsync(int workforcePlanId, CancellationToken cancellationToken);
    Task<FiscalYearPlanningSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken);
    Task<WorkforceBudget?> GetEffectiveBudgetAsync(int fiscalYearId, int? excludedId, CancellationToken cancellationToken);
    Task<WorkforcePlan?> GetPlanForUpdateAsync(int planId, CancellationToken cancellationToken);
    void RemovePeriodAllocations(IReadOnlyCollection<WorkforceBudgetPeriodAllocation> allocations);
    void RemoveLines(IReadOnlyCollection<WorkforceBudgetLine> lines);
    void ApplyRowVersion(WorkforceBudget budget, string rowVersion);
}

public sealed record BudgetPlanLinePeriodSnapshot(
    int FiscalPeriodId,
    int NewHireSlots,
    int ReplacementSlots);

public sealed record BudgetPlanLineSnapshot(
    int Id,
    int PositionId,
    int? TargetBranchId,
    int DepartmentId,
    int DivisionId,
    int NewHireSlots,
    int ReplacementSlots,
    int PlannedHiringSlots,
    IReadOnlyList<BudgetPlanLinePeriodSnapshot> PeriodTargets);

public sealed record BudgetPlanSnapshot(
    int Id,
    int FiscalYearId,
    int RevisionNumber,
    string Status,
    IReadOnlyList<BudgetPlanLineSnapshot> Lines);
