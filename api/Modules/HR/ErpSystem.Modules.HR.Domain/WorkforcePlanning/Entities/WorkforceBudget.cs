using ErpSystem.Modules.HR.Domain.Common.Entities;
using ErpSystem.Modules.HR.Domain.Common.Exceptions;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using static ErpSystem.Modules.HR.Domain.Common.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

public sealed class WorkforceBudget : CompanyAuditableEntity
{
    public const string CalculationPolicy = "2026-09-V1";

    private readonly List<WorkforceBudgetLine> _lines = [];

    private WorkforceBudget()
    {
    }

    public WorkforceBudget(
        string budgetCode,
        int workforcePlanId,
        int fiscalYearId,
        int revisionNumber,
        string currencyCode)
    {
        BudgetCode = Required(budgetCode, nameof(budgetCode)).ToUpperInvariant();
        WorkforcePlanId = Positive(workforcePlanId, nameof(workforcePlanId));
        FiscalYearId = Positive(fiscalYearId, nameof(fiscalYearId));
        RevisionNumber = revisionNumber > 0 ? revisionNumber : throw new ArgumentOutOfRangeException(nameof(revisionNumber));
        CurrencyCode = NormalizeCurrencyCode(currencyCode, nameof(currencyCode));
        CalculationPolicyVersion = CalculationPolicy;
    }

    public int Id { get; private set; }
    public string BudgetCode { get; private set; } = string.Empty;
    public int WorkforcePlanId { get; private set; }
    public int FiscalYearId { get; private set; }
    public int RevisionNumber { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public string CalculationPolicyVersion { get; private set; } = CalculationPolicy;
    public WorkforceBudgetStatus Status { get; private set; } = WorkforceBudgetStatus.Draft;
    public DateTimeOffset? SubmittedOn { get; private set; }
    public string? SubmittedById { get; private set; }
    public DateTimeOffset? ApprovedOn { get; private set; }
    public string? ApprovedById { get; private set; }
    public DateTimeOffset? RejectedOn { get; private set; }
    public string? RejectedById { get; private set; }
    public string? DecisionReason { get; private set; }
    public DateTimeOffset? ActivatedOn { get; private set; }
    public DateTimeOffset? SupersededOn { get; private set; }
    public IReadOnlyCollection<WorkforceBudgetLine> Lines =>
        _lines.Where(line => !line.IsDeleted).OrderBy(line => line.Id).ToArray();

    public int TotalAuthorizedHeadcount => Lines.Sum(line => line.AuthorizedHeadcount);
    public decimal TotalSalaryBudget => Lines.Sum(line => line.AllocatedSalaryBudget);
    public decimal TotalRecruitmentBudget => Lines.Sum(line => line.AllocatedRecruitmentBudget);
    public decimal GrandTotalBudget => TotalSalaryBudget + TotalRecruitmentBudget;

    public void UpdateDraft(string currencyCode)
    {
        EnsureEditable();
        CurrencyCode = NormalizeCurrencyCode(currencyCode, nameof(currencyCode));
    }

    public WorkforceBudgetLine AddLine(
        int workforcePlanLineId,
        int positionId,
        int? branchId,
        int departmentId,
        int divisionId,
        int authorizedHeadcount,
        decimal allocatedSalaryBudget,
        decimal allocatedRecruitmentBudget)
    {
        EnsureEditable();
        var line = new WorkforceBudgetLine(
            this,
            workforcePlanLineId,
            positionId,
            branchId,
            departmentId,
            divisionId,
            authorizedHeadcount,
            allocatedSalaryBudget,
            allocatedRecruitmentBudget);
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
        EnsureStatus(WorkforceBudgetStatus.Draft, WorkforceBudgetStatus.Rejected);
        if (_lines.Count == 0)
            throw new DomainRuleException("WorkforceBudget.LinesRequired", "A workforce budget must contain at least one line.");
        foreach (var line in _lines.Where(line => !line.IsDeleted))
            line.ValidateAllocations();
        SubmittedOn = submittedOn;
        SubmittedById = Required(submittedById, nameof(submittedById));
        DecisionReason = null;
        Status = WorkforceBudgetStatus.Submitted;
    }

    public void Approve(DateTimeOffset approvedOn, string approvedById, bool fiscalYearIsOpen)
    {
        if (!fiscalYearIsOpen)
            throw new DomainRuleException("WorkforceBudget.FiscalYearMustBeOpen", "A budget can only be approved while its fiscal year is open.");
        EnsureStatus(WorkforceBudgetStatus.Submitted);
        ApprovedOn = approvedOn;
        ApprovedById = Required(approvedById, nameof(approvedById));
        RejectedOn = null;
        RejectedById = null;
        DecisionReason = null;
        Status = WorkforceBudgetStatus.Approved;
    }

    public void Reject(DateTimeOffset rejectedOn, string rejectedById, string reason)
    {
        EnsureStatus(WorkforceBudgetStatus.Submitted);
        RejectedOn = rejectedOn;
        RejectedById = Required(rejectedById, nameof(rejectedById));
        DecisionReason = Required(reason, nameof(reason));
        Status = WorkforceBudgetStatus.Rejected;
    }

    public void Activate(DateTimeOffset activatedOn)
    {
        EnsureStatus(WorkforceBudgetStatus.Approved);
        ActivatedOn ??= activatedOn;
    }

    public void Supersede(DateTimeOffset supersededOn)
    {
        if (Status == WorkforceBudgetStatus.Superseded)
            return;
        EnsureStatus(WorkforceBudgetStatus.Approved);
        SupersededOn = supersededOn;
        Status = WorkforceBudgetStatus.Superseded;
    }

    private void EnsureEditable()
    {
        if (Status is not (WorkforceBudgetStatus.Draft or WorkforceBudgetStatus.Rejected))
            throw new DomainRuleException("WorkforceBudget.NotEditable", "Only a draft or rejected budget can be edited.");
    }

    private void EnsureStatus(params WorkforceBudgetStatus[] expected)
    {
        if (!expected.Contains(Status))
            throw new DomainRuleException("WorkforceBudget.InvalidStatusTransition", $"The budget cannot be changed from {Status}.");
    }

    public static decimal NormalizeMoney(decimal value) =>
        decimal.Round(value, 2, MidpointRounding.AwayFromZero);
}

public sealed class WorkforceBudgetLine : CompanyAuditableEntity
{
    private readonly List<WorkforceBudgetPeriodAllocation> _periodAllocations = [];

    private WorkforceBudgetLine()
    {
    }

    internal WorkforceBudgetLine(
        WorkforceBudget budget,
        int workforcePlanLineId,
        int positionId,
        int? branchId,
        int departmentId,
        int divisionId,
        int authorizedHeadcount,
        decimal allocatedSalaryBudget,
        decimal allocatedRecruitmentBudget)
    {
        WorkforceBudget = budget;
        WorkforcePlanLineId = Positive(workforcePlanLineId, nameof(workforcePlanLineId));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = PositiveOrNull(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        DivisionId = Positive(divisionId, nameof(divisionId));
        if (authorizedHeadcount < 0)
            throw new ArgumentOutOfRangeException(nameof(authorizedHeadcount), "Authorized headcount cannot be negative.");
        AuthorizedHeadcount = authorizedHeadcount;
        AllocatedSalaryBudget = WorkforceBudget.NormalizeMoney(NonNegative(allocatedSalaryBudget, nameof(allocatedSalaryBudget)));
        AllocatedRecruitmentBudget = WorkforceBudget.NormalizeMoney(NonNegative(allocatedRecruitmentBudget, nameof(allocatedRecruitmentBudget)));
    }

    public int Id { get; private set; }
    public int WorkforceBudgetId { get; private set; }
    public WorkforceBudget WorkforceBudget { get; private set; } = null!;
    public int WorkforcePlanLineId { get; private set; }
    public int PositionId { get; private set; }
    public int? BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int DivisionId { get; private set; }
    public int AuthorizedHeadcount { get; private set; }
    public decimal AllocatedSalaryBudget { get; private set; }
    public decimal AllocatedRecruitmentBudget { get; private set; }
    public decimal TotalAllocatedBudget => AllocatedSalaryBudget + AllocatedRecruitmentBudget;
    public IReadOnlyCollection<WorkforceBudgetPeriodAllocation> PeriodAllocations =>
        _periodAllocations.Where(allocation => !allocation.IsDeleted).OrderBy(allocation => allocation.FiscalPeriodId).ToArray();

    public WorkforceBudgetPeriodAllocation AddPeriodAllocation(
        int fiscalPeriodId,
        int targetHeadcount,
        decimal allocatedSalaryCost,
        decimal allocatedRecruitmentCost)
    {
        if (_periodAllocations.Any(allocation => !allocation.IsDeleted && allocation.FiscalPeriodId == fiscalPeriodId))
            throw new DomainRuleException("WorkforceBudget.DuplicatePeriodAllocation", "A fiscal period may appear once per budget line.");
        var allocation = new WorkforceBudgetPeriodAllocation(
            this,
            fiscalPeriodId,
            targetHeadcount,
            allocatedSalaryCost,
            allocatedRecruitmentCost);
        _periodAllocations.Add(allocation);
        return allocation;
    }

    public void ValidateAllocations()
    {
        var allocations = PeriodAllocations;
        if (allocations.Sum(allocation => allocation.TargetHeadcount) != AuthorizedHeadcount)
            throw new DomainRuleException(
                "WorkforceBudget.HeadcountMismatch",
                "Period headcount allocations must equal the line's authorized headcount.");
        if (allocations.Sum(allocation => allocation.AllocatedSalaryCost) != AllocatedSalaryBudget)
            throw new DomainRuleException(
                "WorkforceBudget.SalaryMismatch",
                "Period salary allocations must equal the line's allocated salary budget.");
        if (allocations.Sum(allocation => allocation.AllocatedRecruitmentCost) != AllocatedRecruitmentBudget)
            throw new DomainRuleException(
                "WorkforceBudget.RecruitmentMismatch",
                "Period recruitment allocations must equal the line's allocated recruitment budget.");
    }
}

public sealed class WorkforceBudgetPeriodAllocation : CompanyAuditableEntity
{
    private WorkforceBudgetPeriodAllocation()
    {
    }

    internal WorkforceBudgetPeriodAllocation(
        WorkforceBudgetLine line,
        int fiscalPeriodId,
        int targetHeadcount,
        decimal allocatedSalaryCost,
        decimal allocatedRecruitmentCost)
    {
        WorkforceBudgetLine = line;
        FiscalPeriodId = Positive(fiscalPeriodId, nameof(fiscalPeriodId));
        if (targetHeadcount < 0)
            throw new ArgumentOutOfRangeException(nameof(targetHeadcount), "Target headcount cannot be negative.");
        TargetHeadcount = targetHeadcount;
        AllocatedSalaryCost = WorkforceBudget.NormalizeMoney(NonNegative(allocatedSalaryCost, nameof(allocatedSalaryCost)));
        AllocatedRecruitmentCost = WorkforceBudget.NormalizeMoney(NonNegative(allocatedRecruitmentCost, nameof(allocatedRecruitmentCost)));
    }

    public int Id { get; private set; }
    public int WorkforceBudgetLineId { get; private set; }
    public WorkforceBudgetLine WorkforceBudgetLine { get; private set; } = null!;
    public int FiscalPeriodId { get; private set; }
    public int TargetHeadcount { get; private set; }
    public decimal AllocatedSalaryCost { get; private set; }
    public decimal AllocatedRecruitmentCost { get; private set; }
}
