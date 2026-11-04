using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

public interface IGlobalCrystalReportStore
{
    Task<CrystalReportPageResponse> ListAsync(IReadOnlyCollection<string> entityKeys, string? search, int page, int pageSize,
        CancellationToken cancellationToken, string? status = null);
    Task<CrystalReportDetailResponse?> DetailAsync(Guid id, CancellationToken cancellationToken);
    Task<GlobalCrystalReport?> FindAsync(Guid id, CancellationToken cancellationToken);
    Task<GlobalCrystalReport?> FindByKeyAsync(string entityKey, string reportKey, CancellationToken cancellationToken);
    Task<GlobalCrystalReportVersion?> VersionAsync(Guid id, Guid versionId, CancellationToken cancellationToken);
    Task<bool> KeyExistsAsync(string entityKey, string reportKey, CancellationToken cancellationToken);
    Task<int> NextVersionAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entityKey, CancellationToken cancellationToken);
    void Add(GlobalCrystalReport report);
    void AddVersion(GlobalCrystalReportVersion version);
    void ApplyRowVersion(GlobalCrystalReport report, byte[] rowVersion);
}

public sealed record GlobalCrystalManagedCatalogEntry(
    Guid ReportId, string EntityKey, string ReportKey, string DisplayName, string? Description,
    GlobalCrystalReportVersion? PublishedVersion, DateTime? UpdatedOn)
{
    public string? ViewName { get; init; }
    public string? ViewFingerprint { get; init; }
}
