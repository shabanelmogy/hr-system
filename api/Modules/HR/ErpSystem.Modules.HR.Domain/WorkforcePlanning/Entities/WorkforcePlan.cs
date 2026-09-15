using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

public sealed class WorkforcePlan : CompanyAuditableEntity
{
    private readonly List<WorkforcePlanLine> _lines = [];

    private WorkforcePlan()
    {
    }

    public WorkforcePlan(
        string planCode,
        int fiscalYearId,
        string titleEn,
        string titleAr,
        string? description,
        int revisionNumber = 1,
        Guid? planSeriesId = null,
        int? previousRevisionId = null)
    {
        PlanSeriesId = planSeriesId ?? Guid.NewGuid();
        PlanCode = Required(planCode, nameof(planCode)).ToUpperInvariant();
        FiscalYearId = Positive(fiscalYearId, nameof(fiscalYearId));
        TitleEn = Required(titleEn, nameof(titleEn));
        TitleAr = Required(titleAr, nameof(titleAr));
        Description = Optional(description);
        RevisionNumber = revisionNumber > 0 ? revisionNumber : throw new ArgumentOutOfRangeException(nameof(revisionNumber));
        PreviousRevisionId = PositiveOrNull(previousRevisionId, nameof(previousRevisionId));
    }

    public int Id { get; private set; }
    public Guid PlanSeriesId { get; private set; }
    public string PlanCode { get; private set; } = string.Empty;
    public int FiscalYearId { get; private set; }
    public int RevisionNumber { get; private set; }
    public int? PreviousRevisionId { get; private set; }
    public string TitleEn { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public WorkforcePlanStatus Status { get; private set; } = WorkforcePlanStatus.Draft;
    public DateTimeOffset? SubmittedOn { get; private set; }
    public string? SubmittedById { get; private set; }
    public DateTimeOffset? ApprovedOn { get; private set; }
    public string? ApprovedById { get; private set; }
    public DateTimeOffset? RejectedOn { get; private set; }
    public string? RejectedById { get; private set; }
    public string? DecisionReason { get; private set; }
    public DateTimeOffset? ActivatedOn { get; private set; }
    public DateTimeOffset? SupersededOn { get; private set; }
    public IReadOnlyCollection<WorkforcePlanLine> Lines =>
        _lines.Where(line => !line.IsDeleted).OrderBy(line => line.Id).ToArray();

    public void UpdateDraft(string titleEn, string titleAr, string? description)
    {
        EnsureEditable();
        TitleEn = Required(titleEn, nameof(titleEn));
        TitleAr = Required(titleAr, nameof(titleAr));
        Description = Optional(description);
    }

    public WorkforcePlanLine AddLine(
        int positionId,
        int? targetBranchId,
        int departmentId,
        int divisionId,
        int baselineHeadcount,
        DateOnly baselineAsOfDate,
        int newHireSlots,
        int replacementSlots,
        string? justification)
    {
        EnsureEditable();
        var line = new WorkforcePlanLine(
            this,
            positionId,
            targetBranchId,
            departmentId,
            divisionId,
            baselineHeadcount,
            baselineAsOfDate,
            newHireSlots,
            replacementSlots,
            justification);
        _lines.Add(line);
        return line;
    }

    public void RemoveDraftLines()
    {
        EnsureEditable();
        _lines.Clear();
    }

    public void Submit(DateTimeOffset submittedOn, string submittedById)
    {
        EnsureStatus(WorkforcePlanStatus.Draft, WorkforcePlanStatus.Rejected);
        if (_lines.Count == 0)
            throw new DomainRuleException("WorkforcePlan.LinesRequired", "A workforce plan must contain at least one line.");
        foreach (var line in _lines.Where(line => !line.IsDeleted))
            line.ValidatePeriodTotals();
        SubmittedOn = submittedOn;
        SubmittedById = Required(submittedById, nameof(submittedById));
        DecisionReason = null;
        Status = WorkforcePlanStatus.Submitted;
    }

    public void BeginReview()
    {
        EnsureStatus(WorkforcePlanStatus.Submitted);
        Status = WorkforcePlanStatus.UnderReview;
    }

    public void Approve(DateTimeOffset approvedOn, string approvedById, bool fiscalYearIsOpen, bool allowSelfApproval = false)
    {
        if (!fiscalYearIsOpen)
            throw new DomainRuleException("WorkforcePlan.FiscalYearMustBeOpen", "A plan can only be approved while its fiscal year is open.");
        EnsureStatus(WorkforcePlanStatus.UnderReview);
        var approver = Required(approvedById, nameof(approvedById));
        if (!allowSelfApproval && string.Equals(approver, CreatedById, StringComparison.OrdinalIgnoreCase))
            throw new DomainRuleException("WorkforcePlan.SelfApproval", "The plan creator cannot approve the same plan.");
        ApprovedOn = approvedOn;
        ApprovedById = approver;
        RejectedOn = null;
        RejectedById = null;
        DecisionReason = null;
        Status = WorkforcePlanStatus.Approved;
    }

    public void Reject(DateTimeOffset rejectedOn, string rejectedById, string reason)
    {
        EnsureStatus(WorkforcePlanStatus.UnderReview);
        RejectedOn = rejectedOn;
        RejectedById = Required(rejectedById, nameof(rejectedById));
        DecisionReason = Required(reason, nameof(reason));
        Status = WorkforcePlanStatus.Rejected;
    }

    public void Activate(DateTimeOffset activatedOn)
    {
        EnsureStatus(WorkforcePlanStatus.Approved);
        ActivatedOn ??= activatedOn;
    }

    public void Supersede(DateTimeOffset supersededOn)
    {
        if (Status == WorkforcePlanStatus.Superseded)
            return;
        EnsureStatus(WorkforcePlanStatus.Approved);
        SupersededOn = supersededOn;
        Status = WorkforcePlanStatus.Superseded;
    }

    public void EnsureCanArchive()
    {
        if (Status is not (WorkforcePlanStatus.Draft or WorkforcePlanStatus.Rejected))
            throw new DomainRuleException(
                "WorkforcePlan.NotArchivable",
                "Only a draft or rejected workforce plan can be archived.");
    }

    public void EnsureCanRestore()
    {
        if (Status is not (WorkforcePlanStatus.Draft or WorkforcePlanStatus.Rejected))
            throw new DomainRuleException(
                "WorkforcePlan.NotRestorable",
                "Only an archived draft or rejected workforce plan can be restored.");
    }

    private void EnsureEditable()
    {
        if (Status is not (WorkforcePlanStatus.Draft or WorkforcePlanStatus.Rejected))
            throw new DomainRuleException("WorkforcePlan.NotEditable", "Only a draft or rejected plan can be edited.");
    }

    private void EnsureStatus(params WorkforcePlanStatus[] expected)
    {
        if (!expected.Contains(Status))
            throw new DomainRuleException("WorkforcePlan.InvalidStatusTransition", $"The plan cannot be changed from {Status}.");
    }
}

public sealed class WorkforcePlanLine : CompanyAuditableEntity
{
    private readonly List<WorkforcePlanLinePeriodTarget> _periodTargets = [];

    private WorkforcePlanLine()
    {
    }

    internal WorkforcePlanLine(
        WorkforcePlan plan,
        int positionId,
        int? targetBranchId,
        int departmentId,
        int divisionId,
        int baselineHeadcount,
        DateOnly baselineAsOfDate,
        int newHireSlots,
        int replacementSlots,
        string? justification)
    {
        WorkforcePlan = plan;
        PositionId = Positive(positionId, nameof(positionId));
        TargetBranchId = PositiveOrNull(targetBranchId, nameof(targetBranchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        DivisionId = Positive(divisionId, nameof(divisionId));
        BaselineHeadcount = EnsureNonNegative(baselineHeadcount, nameof(baselineHeadcount));
        BaselineAsOfDate = baselineAsOfDate;
        NewHireSlots = EnsureNonNegative(newHireSlots, nameof(newHireSlots));
        ReplacementSlots = EnsureNonNegative(replacementSlots, nameof(replacementSlots));
        Justification = Optional(justification);
    }

    public int Id { get; private set; }
    public int WorkforcePlanId { get; private set; }
    public WorkforcePlan WorkforcePlan { get; private set; } = null!;
    public int PositionId { get; private set; }
    public int? TargetBranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int DivisionId { get; private set; }
    public int BaselineHeadcount { get; private set; }
    public DateOnly BaselineAsOfDate { get; private set; }
    public int NewHireSlots { get; private set; }
    public int ReplacementSlots { get; private set; }
    public int TargetHeadcount => BaselineHeadcount + NewHireSlots;
    public int PlannedHiringSlots => NewHireSlots + ReplacementSlots;
    public string? Justification { get; private set; }
    public IReadOnlyCollection<WorkforcePlanLinePeriodTarget> PeriodTargets =>
        _periodTargets.Where(target => !target.IsDeleted).OrderBy(target => target.FiscalPeriodId).ToArray();

    public WorkforcePlanLinePeriodTarget AddPeriodTarget(int fiscalPeriodId, int newHireSlots, int replacementSlots)
    {
        if (_periodTargets.Any(target => !target.IsDeleted && target.FiscalPeriodId == fiscalPeriodId))
            throw new DomainRuleException("WorkforcePlan.DuplicatePeriodTarget", "A fiscal period may appear once per plan line.");
        var target = new WorkforcePlanLinePeriodTarget(this, fiscalPeriodId, newHireSlots, replacementSlots);
        _periodTargets.Add(target);
        return target;
    }

    public void ValidatePeriodTotals()
    {
        var newHireTotal = PeriodTargets.Sum(target => target.NewHireSlots);
        var replacementTotal = PeriodTargets.Sum(target => target.ReplacementSlots);
        if (newHireTotal != NewHireSlots || replacementTotal != ReplacementSlots)
            throw new DomainRuleException(
                "WorkforcePlan.PeriodTotalsMismatch",
                "Period allocations must match the line's new-position and replacement counts separately.");
    }

    private static int EnsureNonNegative(int value, string parameterName) =>
        value < 0 ? throw new ArgumentOutOfRangeException(parameterName, "The value cannot be negative.") : value;
}

public sealed class WorkforcePlanLinePeriodTarget : CompanyAuditableEntity
{
    private WorkforcePlanLinePeriodTarget()
    {
    }

    internal WorkforcePlanLinePeriodTarget(WorkforcePlanLine line, int fiscalPeriodId, int newHireSlots, int replacementSlots)
    {
        WorkforcePlanLine = line;
        FiscalPeriodId = Positive(fiscalPeriodId, nameof(fiscalPeriodId));
        NewHireSlots = EnsureNonNegative(newHireSlots, nameof(newHireSlots));
        ReplacementSlots = EnsureNonNegative(replacementSlots, nameof(replacementSlots));
    }

    public int Id { get; private set; }
    public int WorkforcePlanLineId { get; private set; }
    public WorkforcePlanLine WorkforcePlanLine { get; private set; } = null!;
    public int FiscalPeriodId { get; private set; }
    public int NewHireSlots { get; private set; }
    public int ReplacementSlots { get; private set; }

    private static int EnsureNonNegative(int value, string parameterName) =>
        value < 0 ? throw new ArgumentOutOfRangeException(parameterName, "The value cannot be negative.") : value;
}
