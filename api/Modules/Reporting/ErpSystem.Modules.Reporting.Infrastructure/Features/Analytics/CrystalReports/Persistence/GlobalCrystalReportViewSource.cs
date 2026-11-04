using System.Data;
using System.Text;
using ErpSystem.Modules.ReferenceData.Contracts.Reporting;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class GlobalCrystalReportViewSource(IReferenceDataPublicViewSource source,
    ManagedCrystalReportContractRegistry contracts, IOptions<CrystalReportStorageOptions> options) : IGlobalCrystalReportViewSource
{
    public async Task<GlobalCrystalReportViewBinding?> InspectAsync(string sourceKey, string viewName, CancellationToken cancellationToken)
    {
        var data = await source.ReadAsync(viewName, sourceKey, 0, new Dictionary<string, string?>(), cancellationToken);
        return Matches(sourceKey, data) ? new(data!.ViewName, data.Fingerprint) : null;
    }

    public async Task<CrystalReportDataBuildResult> BuildAsync(string sourceKey, string viewName, string fingerprint,
        IReadOnlyDictionary<string, string?> filters, CancellationToken cancellationToken)
    {
        var contract = contracts.GetRequired(sourceKey);
        if (filters.Keys.Any(key => !contract.Filters.Contains(key, StringComparer.Ordinal))) return Failure();
        var prefix = sourceKey switch { "countries" => "Country", "states" => "State", "districts" => "District", _ => "" };
        var mapped = filters.ToDictionary(filter => filter.Key.StartsWith("Name", StringComparison.Ordinal)
            ? prefix + filter.Key[4..] : filter.Key, filter => filter.Value, StringComparer.Ordinal);
        var data = await source.ReadAsync(viewName, sourceKey, contract.MaxRows + 1, mapped, cancellationToken,
            contract.Columns.Select(column => column.Name).ToArray());
        if (!Matches(sourceKey, data) || data!.Fingerprint != fingerprint) return Failure();
        if (data.Rows.Count > contract.MaxRows) return Failure(CrystalReportDataFailure.TooLarge);
        using var dataSet = new DataSet("CrystalReportData") { Locale = CultureInfo.InvariantCulture };
        var table = new DataTable(contract.TableName) { Locale = CultureInfo.InvariantCulture };
        foreach (var column in contract.Columns)
            table.Columns.Add(new DataColumn(column.Name, ManagedCrystalReportContractRegistry.GetClrType(column.Type)) { AllowDBNull = column.Nullable });
        dataSet.Tables.Add(table);
        foreach (var row in data.Rows) table.Rows.Add(row.Select(value => value ?? DBNull.Value).ToArray());
        using var output = new StringWriter(CultureInfo.InvariantCulture);
        dataSet.WriteXml(output, XmlWriteMode.WriteSchema);
        var xml = output.ToString();
        if (Encoding.UTF8.GetByteCount(xml) > options.Value.MaxRuntimeDataSizeBytes) return Failure(CrystalReportDataFailure.TooLarge);
        contracts.ValidateDataSetXml(sourceKey, xml);
        return new(new CrystalReportDataSet(xml), CrystalReportDataFailure.None);
    }

    private bool Matches(string key, ReferencePublicViewData? data)
    {
        if (data is null || !contracts.Supports(key)) return false;
        var expected = contracts.GetRequired(key).Columns;
        return expected.All(column => data.Columns.Any(actual => actual.Name == column.Name &&
            actual.Type == column.Type && actual.Nullable == column.Nullable));
    }
    private static CrystalReportDataBuildResult Failure(CrystalReportDataFailure failure = CrystalReportDataFailure.Unsupported) => new(null, failure);
}
