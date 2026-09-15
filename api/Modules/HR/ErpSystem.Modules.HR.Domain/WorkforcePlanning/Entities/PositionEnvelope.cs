using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

/// <summary>
/// System-generated capacity envelope created atomically for every approved
/// budget line. Phase 3 adds guarded capacity mutations: Reserve, Release,
/// ConsumeReserved, and Expand. Every mutation keeps headcount and money
/// consistent and never clamps with Math.Max or allows negative capacity.
/// </summary>
public sealed class PositionEnvelope : CompanyAuditableEntity
{
    private PositionEnvelope()
    {
    }

    internal PositionEnvelope(
        string envelopeCode,
        int workforceBudgetId,
        int workforceBudgetLineId,
        int workforcePlanId,
        int workforcePlanLineId,
        int fiscalYearId,
        int positionId,
        int? branchId,
        int departmentId,
        int divisionId,
        string currencyCode,
        string calculationPolicyVersion,
        int authorizedHeadcount,
        decimal authorizedSalaryBudget)
    {
        EnvelopeCode = Required(envelopeCode, nameof(envelopeCode)).ToUpperInvariant();
        WorkforceBudgetId = Positive(workforceBudgetId, nameof(workforceBudgetId));
        WorkforceBudgetLineId = Positive(workforceBudgetLineId, nameof(workforceBudgetLineId));
        WorkforcePlanId = Positive(workforcePlanId, nameof(workforcePlanId));
        WorkforcePlanLineId = Positive(workforcePlanLineId, nameof(workforcePlanLineId));
        FiscalYearId = Positive(fiscalYearId, nameof(fiscalYearId));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = PositiveOrNull(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        DivisionId = Positive(divisionId, nameof(divisionId));
        CurrencyCode = NormalizeCurrencyCode(currencyCode, nameof(currencyCode));
        CalculationPolicyVersion = Required(calculationPolicyVersion, nameof(calculationPolicyVersion));
        if (authorizedHeadcount < 0)
            throw new ArgumentOutOfRangeException(nameof(authorizedHeadcount), "Authorized headcount cannot be negative.");
        AuthorizedHeadcount = authorizedHeadcount;
        AuthorizedSalaryBudget = WorkforceBudget.NormalizeMoney(NonNegative(authorizedSalaryBudget, nameof(authorizedSalaryBudget)));
    }

    public static PositionEnvelope FromBudgetLine(WorkforceBudget budget, WorkforceBudgetLine line) =>
        new(
            BuildEnvelopeCode(budget.BudgetCode, line.WorkforcePlanLineId),
            budget.Id,
            line.Id,
            budget.WorkforcePlanId,
            line.WorkforcePlanLineId,
            budget.FiscalYearId,
            line.PositionId,
            line.BranchId,
            line.DepartmentId,
            line.DivisionId,
            budget.CurrencyCode,
            budget.CalculationPolicyVersion,
            line.AuthorizedHeadcount,
            line.AllocatedSalaryBudget);

    public static string BuildEnvelopeCode(string budgetCode, int workforcePlanLineId) =>
        $"{Required(budgetCode, nameof(budgetCode)).ToUpperInvariant()}-P{workforcePlanLineId}";

    public int Id { get; private set; }
    public string EnvelopeCode { get; private set; } = string.Empty;
    public int WorkforceBudgetId { get; private set; }
    public int WorkforceBudgetLineId { get; private set; }
    public int WorkforcePlanId { get; private set; }
    public int WorkforcePlanLineId { get; private set; }
    public int FiscalYearId { get; private set; }
    public int PositionId { get; private set; }
    public int? BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int DivisionId { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public string CalculationPolicyVersion { get; private set; } = string.Empty;
    public int AuthorizedHeadcount { get; private set; }
    public int ReservedHeadcount { get; private set; }
    public int HiredHeadcount { get; private set; }
    public decimal AuthorizedSalaryBudget { get; private set; }
    public decimal ReservedSalaryBudget { get; private set; }
    public decimal ContractedSalaryBudget { get; private set; }

    public int AvailableHeadcount
    {
        get
        {
            var available = AuthorizedHeadcount - ReservedHeadcount - HiredHeadcount;
            if (available < 0)
                throw new DomainRuleException("PositionEnvelope.NegativeCapacity", "The envelope headcount capacity cannot be negative.");
            return available;
        }
    }

    public decimal AvailableSalaryBudget
    {
        get
        {
            var available = AuthorizedSalaryBudget - ReservedSalaryBudget - ContractedSalaryBudget;
            if (available < 0)
                throw new DomainRuleException("PositionEnvelope.NegativeCapacity", "The envelope salary capacity cannot be negative.");
            return available;
        }
    }

    /// <summary>
    /// Atomically reserves headcount and fiscal money for a staffing request.
    /// Throws when either dimension exceeds the currently available capacity.
    /// </summary>
    public void Reserve(int headcount, decimal fiscalCost)
    {
        if (headcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(headcount), "Reserved headcount must be positive.");
        var normalizedCost = WorkforceBudget.NormalizeMoney(NonNegative(fiscalCost, nameof(fiscalCost)));
        if (AvailableHeadcount < headcount)
            throw new DomainRuleException("PositionEnvelope.InsufficientHeadcount", "The envelope does not have enough available headcount.");
        if (AvailableSalaryBudget < normalizedCost)
            throw new DomainRuleException("PositionEnvelope.InsufficientBudget", "The envelope does not have enough available salary budget.");
        ReservedHeadcount += headcount;
        ReservedSalaryBudget = WorkforceBudget.NormalizeMoney(ReservedSalaryBudget + normalizedCost);
    }

    /// <summary>
    /// Releases a previously reserved slice back to available capacity.
    /// Only the reserved (neither allocated nor consumed) portion can be released.
    /// </summary>
    public void Release(int headcount, decimal fiscalCost)
    {
        if (headcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(headcount), "Released headcount must be positive.");
        var normalizedCost = WorkforceBudget.NormalizeMoney(NonNegative(fiscalCost, nameof(fiscalCost)));
        if (ReservedHeadcount < headcount)
            throw new DomainRuleException("PositionEnvelope.OverRelease", "The release exceeds the reserved headcount.");
        if (ReservedSalaryBudget < normalizedCost)
            throw new DomainRuleException("PositionEnvelope.OverRelease", "The release exceeds the reserved salary budget.");
        ReservedHeadcount -= headcount;
        ReservedSalaryBudget = WorkforceBudget.NormalizeMoney(ReservedSalaryBudget - normalizedCost);
    }

    /// <summary>
    /// Converts a reserved slice into hired/contracted capacity (fulfilment).
    /// The consumed slice is never returned by Release.
    /// </summary>
    public void ConsumeReserved(int headcount, decimal fiscalCost)
    {
        if (headcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(headcount), "Consumed headcount must be positive.");
        var normalizedCost = WorkforceBudget.NormalizeMoney(NonNegative(fiscalCost, nameof(fiscalCost)));
        if (ReservedHeadcount < headcount)
            throw new DomainRuleException("PositionEnvelope.OverConsume", "The consumption exceeds the reserved headcount.");
        if (ReservedSalaryBudget < normalizedCost)
            throw new DomainRuleException("PositionEnvelope.OverConsume", "The consumption exceeds the reserved salary budget.");
        ReservedHeadcount -= headcount;
        ReservedSalaryBudget = WorkforceBudget.NormalizeMoney(ReservedSalaryBudget - normalizedCost);
        HiredHeadcount += headcount;
        ContractedSalaryBudget = WorkforceBudget.NormalizeMoney(ContractedSalaryBudget + normalizedCost);
    }

    /// <summary>
    /// Expands authorized capacity. Used atomically when an envelope
    /// amendment is approved. Deltas must be strictly positive.
    /// </summary>
    public void Expand(int additionalHeadcount, decimal additionalSalaryCost)
    {
        if (additionalHeadcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(additionalHeadcount), "Additional headcount must be positive.");
        var normalizedCost = WorkforceBudget.NormalizeMoney(NonNegative(additionalSalaryCost, nameof(additionalSalaryCost)));
        if (normalizedCost <= 0)
            throw new ArgumentOutOfRangeException(nameof(additionalSalaryCost), "Additional salary cost must be positive.");
        AuthorizedHeadcount += additionalHeadcount;
        AuthorizedSalaryBudget = WorkforceBudget.NormalizeMoney(AuthorizedSalaryBudget + normalizedCost);
    }

    /// <summary>Adjusts the salary reservation when approved offer terms differ from the estimate.</summary>
    public void AdjustReservedSalary(decimal delta)
    {
        var normalizedDelta = WorkforceBudget.NormalizeMoney(delta);
        if (normalizedDelta == 0)
            return;
        if (normalizedDelta > 0 && AvailableSalaryBudget < normalizedDelta)
            throw new DomainRuleException("PositionEnvelope.InsufficientBudget", "The envelope does not have enough salary capacity for the offer.");
        if (normalizedDelta < 0 && ReservedSalaryBudget < -normalizedDelta)
            throw new DomainRuleException("PositionEnvelope.OverRelease", "The salary release exceeds the reserved amount.");
        ReservedSalaryBudget = WorkforceBudget.NormalizeMoney(ReservedSalaryBudget + normalizedDelta);
    }
}
