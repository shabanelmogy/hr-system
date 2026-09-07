using HrManagementSystem.Domain.WorkforcePlanning.Enums;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;

public sealed record WorkforceBudgetPeriodAllocationRequest(
    int FiscalPeriodId,
    int TargetHeadcount,
    decimal AllocatedSalaryCost,
    decimal AllocatedRecruitmentCost);

public sealed record WorkforceBudgetLineRequest(
    int WorkforcePlanLineId,
    int AuthorizedHeadcount,
    decimal AllocatedSalaryBudget,
    decimal AllocatedRecruitmentBudget,
    IReadOnlyList<WorkforceBudgetPeriodAllocationRequest> PeriodAllocations);

public sealed record CreateWorkforceBudgetRequest(
    string BudgetCode,
    int WorkforcePlanId,
    string CurrencyCode,
    IReadOnlyList<WorkforceBudgetLineRequest> Lines);

public sealed record UpdateWorkforceBudgetRequest(
    string CurrencyCode,
    IReadOnlyList<WorkforceBudgetLineRequest> Lines,
    string RowVersion);

public sealed record WorkforceBudgetActionRequest(string RowVersion);
public sealed record RejectWorkforceBudgetRequest(string Reason, string RowVersion);

public sealed record WorkforceBudgetListItemResponse(
    int Id,
    string BudgetCode,
    int WorkforcePlanId,
    int FiscalYearId,
    int RevisionNumber,
    string CurrencyCode,
    WorkforceBudgetStatus Status,
    int TotalAuthorizedHeadcount,
    decimal TotalSalaryBudget,
    decimal TotalRecruitmentBudget,
    decimal GrandTotalBudget,
    bool IsEffective,
    DateTimeOffset? ActivatedOn,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record WorkforceBudgetPeriodAllocationResponse(
    int Id,
    int FiscalPeriodId,
    int TargetHeadcount,
    decimal AllocatedSalaryCost,
    decimal AllocatedRecruitmentCost);

public sealed record WorkforceBudgetLineResponse(
    int Id,
    int WorkforcePlanLineId,
    int PositionId,
    int? BranchId,
    int DepartmentId,
    int DivisionId,
    int AuthorizedHeadcount,
    decimal AllocatedSalaryBudget,
    decimal AllocatedRecruitmentBudget,
    decimal TotalAllocatedBudget,
    IReadOnlyList<WorkforceBudgetPeriodAllocationResponse> PeriodAllocations);

public sealed record WorkforceBudgetDetailResponse(
    int Id,
    string BudgetCode,
    int WorkforcePlanId,
    int FiscalYearId,
    int RevisionNumber,
    string CurrencyCode,
    string CalculationPolicyVersion,
    WorkforceBudgetStatus Status,
    DateTimeOffset? SubmittedOn,
    string? SubmittedById,
    DateTimeOffset? ApprovedOn,
    string? ApprovedById,
    DateTimeOffset? RejectedOn,
    string? RejectedById,
    string? DecisionReason,
    DateTimeOffset? ActivatedOn,
    DateTimeOffset? SupersededOn,
    int TotalAuthorizedHeadcount,
    decimal TotalSalaryBudget,
    decimal TotalRecruitmentBudget,
    decimal GrandTotalBudget,
    bool IsEffective,
    IReadOnlyList<WorkforceBudgetLineResponse> Lines,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record BudgetSourcePlanPeriodResponse(
    int FiscalPeriodId,
    int NewHireSlots,
    int ReplacementSlots);

public sealed record BudgetSourcePlanLineResponse(
    int Id,
    int PositionId,
    int? TargetBranchId,
    int DepartmentId,
    int DivisionId,
    int BaselineHeadcount,
    int NewHireSlots,
    int ReplacementSlots,
    int PlannedHiringSlots,
    string? Justification,
    IReadOnlyList<BudgetSourcePlanPeriodResponse> PeriodTargets);

public sealed record BudgetSourcePlanResponse(
    int Id,
    string PlanCode,
    int FiscalYearId,
    int RevisionNumber,
    string TitleEn,
    string TitleAr,
    IReadOnlyList<int> FiscalPeriodIds,
    IReadOnlyList<BudgetSourcePlanLineResponse> Lines);

public sealed record PositionEnvelopeListItemResponse(
    int Id,
    string EnvelopeCode,
    int WorkforceBudgetId,
    int FiscalYearId,
    int PositionId,
    int? BranchId,
    int DepartmentId,
    int DivisionId,
    string CurrencyCode,
    int AuthorizedHeadcount,
    int ReservedHeadcount,
    int HiredHeadcount,
    int AvailableHeadcount,
    decimal AuthorizedSalaryBudget,
    decimal ReservedSalaryBudget,
    decimal ContractedSalaryBudget,
    decimal AvailableSalaryBudget,
    DateTime CreatedOn,
    string RowVersion);

public sealed record PositionEnvelopeDetailResponse(
    int Id,
    string EnvelopeCode,
    int WorkforceBudgetId,
    int WorkforceBudgetLineId,
    int WorkforcePlanId,
    int WorkforcePlanLineId,
    int FiscalYearId,
    int PositionId,
    int? BranchId,
    int DepartmentId,
    int DivisionId,
    string CurrencyCode,
    string CalculationPolicyVersion,
    int AuthorizedHeadcount,
    int ReservedHeadcount,
    int HiredHeadcount,
    int AvailableHeadcount,
    decimal AuthorizedSalaryBudget,
    decimal ReservedSalaryBudget,
    decimal ContractedSalaryBudget,
    decimal AvailableSalaryBudget,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);
