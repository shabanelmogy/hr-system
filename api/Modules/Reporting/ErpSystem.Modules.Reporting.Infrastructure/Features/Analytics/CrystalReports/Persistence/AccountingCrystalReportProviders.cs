using System.Data;
using ErpSystem.Modules.Accounting.Contracts.Reporting;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

internal sealed class FiscalYearsCrystalReportDataProvider(IAccountingReportingSource accounting)
    : CrystalReportDataProviderBase
{
    private static readonly IReadOnlySet<string> FiltersSet =
        Filters("Code", "NameAr", "NameEn");

    public override string EntityKey => "fiscalyears";
    protected override IReadOnlySet<string> ApprovedFilters => FiltersSet;

    protected override async Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var rows = await accounting.GetFiscalYearsAsync(
            Filter(filters, "Code"),
            Filter(filters, "NameAr"),
            Filter(filters, "NameEn"),
            OverflowProbeRows,
            cancellationToken);
        if (ExceedsRowLimit(rows))
            return TooLarge();

        var table = new DataTable("ReportData");
        table.Columns.Add("FiscalYearId", typeof(int));
        table.Columns.Add("FiscalYearCode", typeof(string));
        table.Columns.Add("FiscalYearAr", typeof(string));
        table.Columns.Add("FiscalYearEn", typeof(string));
        table.Columns.Add("FiscalYearStartDate", typeof(DateTime));
        table.Columns.Add("FiscalYearEndDate", typeof(DateTime));
        table.Columns.Add("PeriodFrequency", typeof(string));
        table.Columns.Add("FiscalYearStatus", typeof(string));
        table.Columns.Add("FiscalPeriodId", typeof(int)).AllowDBNull = true;
        table.Columns.Add("FiscalPeriodSequence", typeof(int)).AllowDBNull = true;
        table.Columns.Add("FiscalPeriodCode", typeof(string));
        table.Columns.Add("FiscalPeriodAr", typeof(string));
        table.Columns.Add("FiscalPeriodEn", typeof(string));
        table.Columns.Add("FiscalPeriodStartDate", typeof(DateTime)).AllowDBNull = true;
        table.Columns.Add("FiscalPeriodEndDate", typeof(DateTime)).AllowDBNull = true;
        table.Columns.Add("FiscalPeriodStatus", typeof(string));

        foreach (var row in rows)
        {
            table.Rows.Add(
                row.FiscalYearId,
                row.FiscalYearCode,
                row.FiscalYearAr,
                row.FiscalYearEn,
                row.FiscalYearStartDate.ToDateTime(TimeOnly.MinValue),
                row.FiscalYearEndDate.ToDateTime(TimeOnly.MinValue),
                row.PeriodFrequency,
                row.FiscalYearStatus,
                row.FiscalPeriodId ?? (object)DBNull.Value,
                row.FiscalPeriodSequence ?? (object)DBNull.Value,
                row.FiscalPeriodCode ?? (object)DBNull.Value,
                row.FiscalPeriodAr ?? (object)DBNull.Value,
                row.FiscalPeriodEn ?? (object)DBNull.Value,
                row.FiscalPeriodStartDate?.ToDateTime(TimeOnly.MinValue) ?? (object)DBNull.Value,
                row.FiscalPeriodEndDate?.ToDateTime(TimeOnly.MinValue) ?? (object)DBNull.Value,
                row.FiscalPeriodStatus ?? (object)DBNull.Value);
        }

        return Success(WriteXml(table));
    }
}
