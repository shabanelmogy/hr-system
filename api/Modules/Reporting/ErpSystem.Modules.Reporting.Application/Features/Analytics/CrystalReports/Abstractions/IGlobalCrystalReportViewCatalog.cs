using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

public interface IGlobalCrystalReportViewCatalog
{
    Task<CrystalReportDatabaseViewPage?> ListAsync(string sourceKey, string? search, int page, int pageSize,
        CancellationToken cancellationToken);
}
