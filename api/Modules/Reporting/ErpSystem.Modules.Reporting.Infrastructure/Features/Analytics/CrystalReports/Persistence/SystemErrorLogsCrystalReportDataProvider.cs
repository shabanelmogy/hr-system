using System.Data;
using System.Globalization;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

internal sealed class SystemErrorLogsCrystalReportDataProvider(
    ISystemErrorLogReportSource source, GlobalCrystalReportConsumerPolicy policy) : CrystalReportDataProviderBase
{
    public override string EntityKey => "system-error-logs";
    internal override int MaximumRowCount => ISystemErrorLogReportSource.MaximumRows;
    protected override IReadOnlySet<string> ApprovedFilters { get; } =
        Filters("FromUtc", "ToUtc", "UserName", "Source", "StatusCode", "Search", "ColumnFilters");

    protected override async Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters, CancellationToken cancellationToken)
    {
        if (!policy.Allows(EntityKey) || !TryDate(Filter(filters, "FromUtc"), out var from) ||
            !TryDate(Filter(filters, "ToUtc"), out var to))
            return Unsupported();
        int? status = null;
        if (Filter(filters, "StatusCode") is { } text)
        {
            if (!int.TryParse(text, NumberStyles.None, CultureInfo.InvariantCulture, out var parsed))
                return Unsupported();
            status = parsed;
        }
        var result = await source.ReadAsync(new(from, to, Filter(filters, "UserName"),
            Filter(filters, "Source"), status, Filter(filters, "Search"), Filter(filters, "ColumnFilters")), cancellationToken);
        if (result.Failure == SystemErrorLogReportFailure.TooLarge) return TooLarge();
        if (result.Failure != SystemErrorLogReportFailure.None) return Unsupported();
        if (result.Rows.Count > MaximumRowCount) return TooLarge();

        var table = new DataTable("ReportData") { Locale = CultureInfo.InvariantCulture };
        AddColumn(table, "Id", typeof(string), false);
        AddColumn(table, "OccurredOnUtc", typeof(DateTime), false).DateTimeMode = DataSetDateTime.Utc;
        AddColumn(table, "Source", typeof(string), false);
        AddColumn(table, "Severity", typeof(string), false);
        AddColumn(table, "Summary", typeof(string), false);
        foreach (var name in new[] { "UserName", "Service", "Action" }) AddColumn(table, name, typeof(string), true);
        AddColumn(table, "StatusCode", typeof(int), true);
        foreach (var name in new[] { "DurationMs", "CorrelationId", "Client", "Browser" }) AddColumn(table, name, typeof(string), true);
        foreach (var row in result.Rows)
            table.Rows.Add(row.Id.ToString("D"), row.OccurredOnUtc, row.Source, row.Severity, row.Summary,
                Value(row.UserName), Value(row.Service), Value(row.Action), row.StatusCode ?? (object)DBNull.Value,
                Value(row.DurationMs?.ToString(CultureInfo.InvariantCulture)), Value(row.CorrelationId), Value(row.Client), Value(row.Browser));
        return Success(WriteXml(table));
    }

    private static object Value(string? value) => value ?? (object)DBNull.Value;
    private static CrystalReportDataBuildResult Unsupported() => new(null, CrystalReportDataFailure.Unsupported);
    private static bool TryDate(string? value, out DateTime? date)
    {
        date = null;
        if (value is null) return true;
        if (!value.EndsWith('Z') || !DateTime.TryParse(value, CultureInfo.InvariantCulture,
            DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out var parsed)) return false;
        date = parsed;
        return true;
    }
}
