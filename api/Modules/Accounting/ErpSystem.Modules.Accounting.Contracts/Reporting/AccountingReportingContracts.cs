namespace ErpSystem.Modules.Accounting.Contracts.Reporting;

public sealed record AccountingFiscalYearReportRow(
    int FiscalYearId,
    string FiscalYearCode,
    string FiscalYearAr,
    string FiscalYearEn,
    DateOnly FiscalYearStartDate,
    DateOnly FiscalYearEndDate,
    string PeriodFrequency,
    string FiscalYearStatus,
    int? FiscalPeriodId,
    int? FiscalPeriodSequence,
    string? FiscalPeriodCode,
    string? FiscalPeriodAr,
    string? FiscalPeriodEn,
    DateOnly? FiscalPeriodStartDate,
    DateOnly? FiscalPeriodEndDate,
    string? FiscalPeriodStatus);

/// <summary>
/// Accounting-owned reporting port. Reporting consumes this contract without
/// reading the Accounting schema or depending on Accounting Infrastructure.
/// </summary>
public interface IAccountingReportingSource
{
    Task<IReadOnlyList<AccountingFiscalYearReportRow>> GetFiscalYearsAsync(
        string? code,
        string? nameAr,
        string? nameEn,
        int maximumRows,
        CancellationToken cancellationToken);
}
