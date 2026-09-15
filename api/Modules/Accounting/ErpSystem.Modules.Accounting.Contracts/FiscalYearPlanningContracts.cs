namespace ErpSystem.Modules.Accounting.Contracts;

/// <summary>Read-only fiscal calendar data published for other bounded contexts.</summary>
public sealed record FiscalYearPlanningSnapshot(
    int Id,
    string Code,
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlySet<int> PeriodIds,
    string Status);

public interface IFiscalYearPlanningSource
{
    Task<FiscalYearPlanningSnapshot?> GetAsync(
        string tenantId,
        int companyId,
        int fiscalYearId,
        CancellationToken cancellationToken);
}
