using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

namespace ErpSystem.Modules.Reporting.Tests;

internal sealed class GlobalCrystalReportTestStore : IGlobalCrystalReportStore
{
    public IReadOnlyList<GlobalCrystalManagedCatalogEntry> Catalog { get; set; } = [];
    public int CatalogReads { get; private set; }
    public Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entityKey, CancellationToken cancellationToken)
    {
        CatalogReads++;
        return Task.FromResult<IReadOnlyList<GlobalCrystalManagedCatalogEntry>>(Catalog.Where(item => item.EntityKey == entityKey).ToArray());
    }
    public Task<CrystalReportPageResponse> ListAsync(IReadOnlyCollection<string> entityKeys, string? search, int page, int pageSize, CancellationToken cancellationToken, string? status = null, IReadOnlyList<GlobalCrystalReportFilterGroup>? filters = null) => throw new NotSupportedException();
    public Task<CrystalReportDetailResponse?> DetailAsync(Guid id, CancellationToken cancellationToken) => throw new NotSupportedException();
    public Task<GlobalCrystalReport?> FindAsync(Guid id, CancellationToken cancellationToken) => throw new NotSupportedException();
    public Task<GlobalCrystalReport?> FindByKeyAsync(string entityKey, string reportKey, CancellationToken cancellationToken) => throw new NotSupportedException();
    public Task<GlobalCrystalReportVersion?> VersionAsync(Guid id, Guid versionId, CancellationToken cancellationToken) => throw new NotSupportedException();
    public Task<bool> KeyExistsAsync(string entityKey, string reportKey, CancellationToken cancellationToken) => throw new NotSupportedException();
    public Task<int> NextVersionAsync(Guid id, CancellationToken cancellationToken) => throw new NotSupportedException();
    public void Add(GlobalCrystalReport report) => throw new NotSupportedException();
    public void AddVersion(GlobalCrystalReportVersion version) => throw new NotSupportedException();
    public void ApplyRowVersion(GlobalCrystalReport report, byte[] rowVersion) => throw new NotSupportedException();
}
