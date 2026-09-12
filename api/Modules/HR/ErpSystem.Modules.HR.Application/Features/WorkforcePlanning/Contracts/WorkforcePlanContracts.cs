using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;

public sealed record WorkforcePlanPeriodTargetRequest(
    int FiscalPeriodId,
    int NewHireSlots,
    int ReplacementSlots);

public sealed record WorkforcePlanLineRequest(
    int PositionId,
    int? TargetBranchId,
    int NewHireSlots,
    int ReplacementSlots,
    string? Justification,
    IReadOnlyList<WorkforcePlanPeriodTargetRequest> PeriodTargets);

public sealed record CreateWorkforcePlanRequest(
    string PlanCode,
    int FiscalYearId,
    string TitleEn,
    string TitleAr,
    string? Description,
    IReadOnlyList<WorkforcePlanLineRequest> Lines);

public sealed record UpdateWorkforcePlanRequest(
    string TitleEn,
    string TitleAr,
    string? Description,
    IReadOnlyList<WorkforcePlanLineRequest> Lines,
    string RowVersion);

public sealed record WorkforcePlanActionRequest(string RowVersion);
public sealed record RejectWorkforcePlanRequest(string Reason, string RowVersion);

public sealed record WorkforcePlanListItemResponse(
    int Id,
    Guid PlanSeriesId,
    string PlanCode,
    int FiscalYearId,
    int RevisionNumber,
    string TitleEn,
    string TitleAr,
    WorkforcePlanStatus Status,
    int LinesCount,
    int NewHireSlots,
    int ReplacementSlots,
    int PlannedHiringSlots,
    bool IsEffective,
    bool IsDeleted,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record WorkforcePlanPeriodTargetResponse(
    int Id,
    int FiscalPeriodId,
    int NewHireSlots,
    int ReplacementSlots);

public sealed record WorkforcePlanLineResponse(
    int Id,
    int PositionId,
    int? TargetBranchId,
    int DepartmentId,
    int DivisionId,
    int BaselineHeadcount,
    DateOnly BaselineAsOfDate,
    int NewHireSlots,
    int ReplacementSlots,
    int TargetHeadcount,
    int PlannedHiringSlots,
    string? Justification,
    IReadOnlyList<WorkforcePlanPeriodTargetResponse> PeriodTargets);

public sealed record WorkforcePlanDetailResponse(
    int Id,
    Guid PlanSeriesId,
    string PlanCode,
    int FiscalYearId,
    int RevisionNumber,
    int? PreviousRevisionId,
    string TitleEn,
    string TitleAr,
    string? Description,
    WorkforcePlanStatus Status,
    DateTimeOffset? SubmittedOn,
    string? SubmittedById,
    DateTimeOffset? ApprovedOn,
    string? ApprovedById,
    DateTimeOffset? RejectedOn,
    string? RejectedById,
    string? DecisionReason,
    DateTimeOffset? ActivatedOn,
    DateTimeOffset? SupersededOn,
    IReadOnlyList<WorkforcePlanLineResponse> Lines,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted,
    string RowVersion);
