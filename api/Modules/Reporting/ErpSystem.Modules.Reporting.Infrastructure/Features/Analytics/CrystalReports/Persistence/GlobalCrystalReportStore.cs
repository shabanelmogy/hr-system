using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class GlobalCrystalReportStore(ReportingDbContext context) : IGlobalCrystalReportStore
{
    public async Task<CrystalReportPageResponse> ListAsync(IReadOnlyCollection<string> entityKeys, string? search, int page, int pageSize,
        CancellationToken cancellationToken, string? status = null, IReadOnlyList<GlobalCrystalReportFilterGroup>? filters = null)
    {
        var query = context.GlobalCrystalReports.AsNoTracking().Where(x => entityKeys.Contains(x.EntityKey));
        query = status == "archived" ? query.Where(x => x.IsDeleted) : query.Where(x => !x.IsDeleted);
        if (status == "published") query = query.Where(x => x.CurrentPublishedVersionId != null);
        if (status == "draft") query = query.Where(x => x.CurrentPublishedVersionId == null);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.ReportKey.Contains(term) || x.DisplayName.Contains(term));
        }
        query = GlobalCrystalReportFilterExpressions.Apply(query, filters);
        var count = await query.CountAsync(cancellationToken);
        var reports = await query.Include(x => x.Versions).OrderBy(x => x.DisplayName).ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new CrystalReportPageResponse(reports.Select(ListItem).ToArray(), count);
    }

    public async Task<CrystalReportDetailResponse?> DetailAsync(Guid id, CancellationToken cancellationToken)
    {
        var report = await context.GlobalCrystalReports.AsNoTracking().Include(x => x.Versions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (report is null) return null;
        var item = ListItem(report);
        return new CrystalReportDetailResponse(item.Id, item.EntityKey, item.ReportKey, item.DisplayName,
            item.Description, item.CurrentVersionNumber, item.IsPublished, item.IsArchived, item.RowVersion,
            report.CreatedOn, item.UpdatedOn, report.Versions.OrderByDescending(x => x.VersionNumber)
                .Select(x => VersionItem(x, report.CurrentPublishedVersionId == x.Id)).ToArray(), [])
        { ViewName = report.ViewName, ViewFingerprint = report.ViewFingerprint };
    }

    public Task<GlobalCrystalReport?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        context.GlobalCrystalReports.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<GlobalCrystalReport?> FindByKeyAsync(string entityKey, string reportKey, CancellationToken cancellationToken) =>
        context.GlobalCrystalReports.AsNoTracking()
            .FirstOrDefaultAsync(x => x.EntityKey == entityKey && x.ReportKey == reportKey, cancellationToken);

    public Task<GlobalCrystalReportVersion?> VersionAsync(Guid id, Guid versionId, CancellationToken cancellationToken) =>
        context.GlobalCrystalReportVersions.FirstOrDefaultAsync(x => x.GlobalCrystalReportId == id && x.Id == versionId, cancellationToken);

    public Task<bool> KeyExistsAsync(string entityKey, string reportKey, CancellationToken cancellationToken) =>
        context.GlobalCrystalReports.AnyAsync(x => x.EntityKey == entityKey && x.ReportKey == reportKey, cancellationToken);

    public async Task<int> NextVersionAsync(Guid id, CancellationToken cancellationToken) =>
        (await context.GlobalCrystalReportVersions.Where(x => x.GlobalCrystalReportId == id)
            .MaxAsync(x => (int?)x.VersionNumber, cancellationToken) ?? 0) + 1;

    public async Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entityKey, CancellationToken cancellationToken)
    {
        var reports = await context.GlobalCrystalReports.AsNoTracking().Include(x => x.Versions)
            .Where(x => x.EntityKey == entityKey).OrderBy(x => x.ReportKey).Take(10001).ToListAsync(cancellationToken);
        if (reports.Count > 10000) throw new InvalidOperationException("The global report catalog exceeds its bounded limit.");
        return reports.Select(x => new GlobalCrystalManagedCatalogEntry(x.Id, x.EntityKey, x.ReportKey,
            x.DisplayName, x.Description, x.IsDeleted ? null : x.Versions.FirstOrDefault(v => v.Id == x.CurrentPublishedVersionId),
            x.UpdatedOn) { ViewName = x.ViewName, ViewFingerprint = x.ViewFingerprint }).ToArray();
    }

    public void Add(GlobalCrystalReport report) => context.GlobalCrystalReports.Add(report);
    public void AddVersion(GlobalCrystalReportVersion version) => context.GlobalCrystalReportVersions.Add(version);
    public void ApplyRowVersion(GlobalCrystalReport report, byte[] rowVersion)
    {
        context.Entry(report).Property(x => x.RowVersion).OriginalValue = rowVersion;
        context.Entry(report).State = EntityState.Modified;
    }

    private static CrystalReportListItemResponse ListItem(GlobalCrystalReport report)
    {
        var current = report.Versions.FirstOrDefault(x => x.Id == report.CurrentPublishedVersionId);
        return new CrystalReportListItemResponse(report.Id, report.EntityKey, report.ReportKey, report.DisplayName,
            current?.SummaryTitle, current?.SummarySubject, report.Description, current?.VersionNumber,
            current is not null, report.IsDeleted, Convert.ToBase64String(report.RowVersion), report.UpdatedOn);
    }

    private static CrystalReportVersionResponse VersionItem(GlobalCrystalReportVersion version, bool published) =>
        new(version.Id, version.VersionNumber, version.OriginalFileName, version.Size, version.Sha256,
            version.SummaryTitle, version.SummarySubject, version.ValidationStatus.ToString(), version.ValidationReason,
            version.ValidationContractSchemaVersion, version.ValidationContractFingerprint, published, version.CreatedOn);
}
