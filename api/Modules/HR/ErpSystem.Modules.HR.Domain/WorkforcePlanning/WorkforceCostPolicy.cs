namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning;

/// <summary>
/// Frozen cost-calculation policy for Workforce Planning to Hire V1.
/// Monthly salaries annualize with x12; annual salaries stay unchanged.
/// Fiscal commitment is the annualized salary prorated by the inclusive
/// remaining-day fraction from the target start date to fiscal year end.
/// Money is rounded once at the final boundary to decimal(18,2).
/// </summary>
public static class WorkforceCostPolicy
{
    public const string PolicyVersion = "2026-09-V1";

    public static decimal AnnualizeMonthlySalary(decimal monthlySalary)
    {
        if (monthlySalary < 0)
            throw new ArgumentOutOfRangeException(nameof(monthlySalary), "Salary cannot be negative.");
        return Entities.WorkforceBudget.NormalizeMoney(monthlySalary * 12);
    }

    public static decimal NormalizeAnnualSalary(decimal annualSalary)
    {
        if (annualSalary < 0)
            throw new ArgumentOutOfRangeException(nameof(annualSalary), "Salary cannot be negative.");
        return Entities.WorkforceBudget.NormalizeMoney(annualSalary);
    }

    public static decimal ComputeFiscalCostPerSlot(
        decimal annualizedSalaryPerSlot,
        DateOnly targetStartDate,
        DateOnly fiscalYearStartDate,
        DateOnly fiscalYearEndDate)
    {
        if (annualizedSalaryPerSlot < 0)
            throw new ArgumentOutOfRangeException(nameof(annualizedSalaryPerSlot), "Salary cannot be negative.");
        if (fiscalYearEndDate < fiscalYearStartDate)
            throw new ArgumentException("The fiscal year end must not precede its start.", nameof(fiscalYearEndDate));

        var effectiveStart = targetStartDate > fiscalYearStartDate ? targetStartDate : fiscalYearStartDate;
        if (effectiveStart > fiscalYearEndDate)
            return 0m;

        var wholeYearDays = fiscalYearEndDate.DayNumber - fiscalYearStartDate.DayNumber + 1;
        var remainingDays = fiscalYearEndDate.DayNumber - effectiveStart.DayNumber + 1;
        var prorated = annualizedSalaryPerSlot * remainingDays / wholeYearDays;
        return Entities.WorkforceBudget.NormalizeMoney(prorated);
    }

    public static decimal ComputeTotalReservedCost(decimal fiscalCostPerSlot, int headcount)
    {
        if (headcount <= 0)
            throw new ArgumentOutOfRangeException(nameof(headcount), "Headcount must be positive.");
        if (fiscalCostPerSlot < 0)
            throw new ArgumentOutOfRangeException(nameof(fiscalCostPerSlot), "Cost cannot be negative.");
        return Entities.WorkforceBudget.NormalizeMoney(fiscalCostPerSlot * headcount);
    }
}
