using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class CrystalReportDesignSourceCatalog(ManagedCrystalReportContractRegistry contracts)
    : ICrystalReportDesignSourceCatalog
{
    // Each entry has a reviewed provider registered in Reporting DI and an owning
    // module Contracts adapter. Registering a database View alone grants no access.
    private static readonly IReadOnlyDictionary<string, string> SourceModules =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["countries"] = "reference-data",
            ["states"] = "reference-data",
            ["districts"] = "reference-data",
            ["system-error-logs"] = "platform"
        };

    public IReadOnlyList<CrystalReportDesignSource> Sources { get; } = SourceModules
        .OrderBy(entry => entry.Key, StringComparer.Ordinal)
        .Select(entry =>
        {
            var source = contracts.GetRequired(entry.Key);
            return new CrystalReportDesignSource(source.EntityKey, entry.Value, source.Scope,
                source.TableName, source.MaxRows,
                source.Columns.Select(column => new CrystalReportDesignColumn(column.Name, column.Type, column.Nullable)).ToArray(),
                source.Filters,
                source.Parameters.Select(parameter => new CrystalReportDesignParameter(parameter.Name,
                    parameter.Type, parameter.Required, parameter.AllowMultipleValues,
                    parameter.DiscreteOnly, parameter.AllowedValues)).ToArray(),
                contracts.SchemaVersion, contracts.Fingerprint)
                { BindingKind = entry.Key == "system-error-logs" ? "provider" : "database-view" };
        }).ToArray();
}
