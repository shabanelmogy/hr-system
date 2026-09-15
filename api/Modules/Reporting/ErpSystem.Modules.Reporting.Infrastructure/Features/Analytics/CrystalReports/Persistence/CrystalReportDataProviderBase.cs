using System.Data;
using System.Globalization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

internal abstract class CrystalReportDataProviderBase : ICrystalReportDataProvider
{
    protected const int MaximumRows = 10_000;
    protected const int OverflowProbeRows = MaximumRows + 1;
    protected abstract IReadOnlySet<string> ApprovedFilters { get; }

    public abstract string EntityKey { get; }

    public async Task<CrystalReportDataBuildResult> BuildAsync(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(filters);

        if (filters.Any(item => !ApprovedFilters.Contains(item.Key)))
            return Unsupported();

        return await BuildAsyncCore(filters, cancellationToken);
    }

    protected abstract Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken);

    protected static CrystalReportDataBuildResult Success(string xml) =>
        new(new CrystalReportDataSet(xml), CrystalReportDataFailure.None);

    protected static CrystalReportDataBuildResult TooLarge() =>
        new(null, CrystalReportDataFailure.TooLarge);

    private static CrystalReportDataBuildResult Unsupported() =>
        new(null, CrystalReportDataFailure.Unsupported);

    protected static string? Filter(
        IReadOnlyDictionary<string, string?> filters,
        params string[] keys)
    {
        foreach (var key in keys)
        {
            var match = filters.FirstOrDefault(item =>
                string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(match.Value))
                return match.Value.Trim();
        }

        return null;
    }

    protected static string WriteXml(DataTable table)
    {
        using var writer = new StringWriter(CultureInfo.InvariantCulture);
        table.WriteXml(writer, XmlWriteMode.WriteSchema);
        return writer.ToString();
    }

    protected static IReadOnlySet<string> Filters(params string[] names) =>
        new HashSet<string>(names, StringComparer.OrdinalIgnoreCase);

    protected static bool ExceedsRowLimit<T>(IReadOnlyCollection<T> rows) =>
        rows.Count > MaximumRows;
}
