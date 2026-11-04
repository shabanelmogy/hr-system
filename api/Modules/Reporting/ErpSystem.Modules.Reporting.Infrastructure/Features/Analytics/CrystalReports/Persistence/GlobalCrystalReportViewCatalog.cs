using ErpSystem.Modules.ReferenceData.Contracts.Reporting;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class GlobalCrystalReportViewCatalog(IReferenceDataPublicViewSource source,
    IGlobalCrystalReportViewSource inspector) : IGlobalCrystalReportViewCatalog
{
    public async Task<CrystalReportDatabaseViewPage?> ListAsync(string sourceKey, string? search, int page, int pageSize,
        CancellationToken cancellationToken)
    {
        var discovered = await source.ListAsync(sourceKey, search, page, pageSize, cancellationToken);
        if (discovered is null) return null;
        var items = new List<CrystalReportDatabaseView>();
        foreach (var candidate in discovered.Items)
        {
            if (!candidate.IsSchemaBound)
            {
                items.Add(new(candidate.ViewName, false, "SchemaBindingRequired"));
                continue;
            }
            var compatible = await inspector.InspectAsync(sourceKey, candidate.ViewName, cancellationToken) is not null;
            items.Add(new(candidate.ViewName, compatible, compatible ? null : "ContractMismatch"));
        }
        return new(items, discovered.TotalCount);
    }
}
