using ErpSystem.Modules.Accounting.Contracts.Reporting;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Reporting;

internal sealed class AccountingReportingSource(AccountingDbContext context) : IAccountingReportingSource
{
    public async Task<IReadOnlyList<AccountingFiscalYearReportRow>> GetFiscalYearsAsync(
        string? code,
        string? nameAr,
        string? nameEn,
        int maximumRows,
        CancellationToken cancellationToken)
    {
        var limit = ValidateMaximumRows(maximumRows);
        var rows = await (
            from fiscalYear in context.FiscalYears.AsNoTracking()
            where !fiscalYear.IsDeleted
                  && (code == null || fiscalYear.Code == code)
                  && (nameAr == null || fiscalYear.NameAr == nameAr)
                  && (nameEn == null || fiscalYear.NameEn == nameEn)
            from period in context.FiscalPeriods.AsNoTracking()
                .Where(item => !item.IsDeleted && item.FiscalYearId == fiscalYear.Id)
                .DefaultIfEmpty()
            orderby fiscalYear.StartDate, fiscalYear.Id, period == null ? 0 : period.Sequence
            select new
            {
                FiscalYearId = fiscalYear.Id,
                FiscalYearCode = fiscalYear.Code,
                FiscalYearAr = fiscalYear.NameAr,
                FiscalYearEn = fiscalYear.NameEn,
                FiscalYearStartDate = fiscalYear.StartDate,
                FiscalYearEndDate = fiscalYear.EndDate,
                PeriodFrequency = (int)fiscalYear.PeriodFrequency,
                FiscalYearStatus = (int)fiscalYear.Status,
                FiscalPeriodId = period == null ? (int?)null : period.Id,
                FiscalPeriodSequence = period == null ? (int?)null : period.Sequence,
                FiscalPeriodCode = period == null ? null : period.Code,
                FiscalPeriodAr = period == null ? null : period.NameAr,
                FiscalPeriodEn = period == null ? null : period.NameEn,
                FiscalPeriodStartDate = period == null ? (DateOnly?)null : period.StartDate,
                FiscalPeriodEndDate = period == null ? (DateOnly?)null : period.EndDate,
                FiscalPeriodStatus = period == null ? (int?)null : (int)period.Status
            })
            .Take(limit)
            .ToListAsync(cancellationToken);

        return rows.Select(row => new AccountingFiscalYearReportRow(
            row.FiscalYearId,
            row.FiscalYearCode,
            row.FiscalYearAr,
            row.FiscalYearEn,
            row.FiscalYearStartDate,
            row.FiscalYearEndDate,
            PeriodFrequencyName(row.PeriodFrequency),
            FiscalYearStatusName(row.FiscalYearStatus),
            row.FiscalPeriodId,
            row.FiscalPeriodSequence,
            row.FiscalPeriodCode,
            row.FiscalPeriodAr,
            row.FiscalPeriodEn,
            row.FiscalPeriodStartDate,
            row.FiscalPeriodEndDate,
            row.FiscalPeriodStatus is int status ? FiscalPeriodStatusName(status) : null))
            .ToArray();
    }

    private static int ValidateMaximumRows(int maximumRows) =>
        maximumRows is > 0 and <= 100_001
            ? maximumRows
            : throw new ArgumentOutOfRangeException(nameof(maximumRows));

    private static string PeriodFrequencyName(int value) => value switch
    {
        1 => "Monthly",
        2 => "Quarterly",
        _ => "Unknown"
    };

    private static string FiscalYearStatusName(int value) => value switch
    {
        1 => "Draft",
        2 => "Open",
        3 => "Closing",
        4 => "Closed",
        5 => "Locked",
        _ => "Unknown"
    };

    private static string FiscalPeriodStatusName(int value) => value switch
    {
        1 => "Draft",
        2 => "Open",
        3 => "Closed",
        4 => "Locked",
        _ => "Unknown"
    };
}
