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
        AddColumn(table, "FiscalYearId", typeof(int), nullable: false);
        AddColumn(table, "FiscalYearCode", typeof(string), nullable: false);
        AddColumn(table, "FiscalYearAr", typeof(string), nullable: false);
        AddColumn(table, "FiscalYearEn", typeof(string), nullable: false);
        AddColumn(table, "FiscalYearStartDate", typeof(DateTime), nullable: false);
        AddColumn(table, "FiscalYearEndDate", typeof(DateTime), nullable: false);
        AddColumn(table, "PeriodFrequency", typeof(string), nullable: false);
        AddColumn(table, "FiscalYearStatus", typeof(string), nullable: false);
        AddColumn(table, "FiscalPeriodId", typeof(int), nullable: true);
        AddColumn(table, "FiscalPeriodSequence", typeof(int), nullable: true);
        AddColumn(table, "FiscalPeriodCode", typeof(string), nullable: true);
        AddColumn(table, "FiscalPeriodAr", typeof(string), nullable: true);
        AddColumn(table, "FiscalPeriodEn", typeof(string), nullable: true);
        AddColumn(table, "FiscalPeriodStartDate", typeof(DateTime), nullable: true);
        AddColumn(table, "FiscalPeriodEndDate", typeof(DateTime), nullable: true);
        AddColumn(table, "FiscalPeriodStatus", typeof(string), nullable: true);

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
