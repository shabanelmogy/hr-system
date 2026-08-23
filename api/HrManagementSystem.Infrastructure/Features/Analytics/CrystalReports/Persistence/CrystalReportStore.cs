using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class CrystalReportStore(
    ApplicationDbContext context,
    ICurrentActor currentActor) : ICrystalReportStore
{
    public Task<IReadOnlyList<CrystalReportListItemResponse>> ListPublishedAsync(
        string? entityKey, string? search, CrystalReportRight requiredRight,
        bool bypassAcl, CancellationToken cancellationToken) =>
        ListAsync(entityKey, search, includeArchived: false, publishedOnly: true,
            requiredRight, bypassAcl, cancellationToken);

    public async Task<CrystalReportPageResponse> ListManagementAsync(
        string? entityKey, string? search, string? status, int page, int pageSize,
        CancellationToken cancellationToken)
    {
        var query = BuildQuery(
            entityKey, search, includeArchived: status == "archived",
            publishedOnly: false, requiredRight: null, bypassAcl: true);
        query = status switch
        {
            "published" => query.Where(x => !x.IsDeleted && x.CurrentPublishedVersionId != null),
            "draft" => query.Where(x => !x.IsDeleted && x.CurrentPublishedVersionId == null),
            "archived" => query.Where(x => x.IsDeleted),
            _ => query.Where(x => !x.IsDeleted)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await ProjectList(query)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return new CrystalReportPageResponse(items, totalCount);
    }

    private async Task<IReadOnlyList<CrystalReportListItemResponse>> ListAsync(
        string? entityKey, string? search, bool includeArchived, bool publishedOnly,
        CrystalReportRight? requiredRight, bool bypassAcl,
        CancellationToken cancellationToken)
    {
        var query = BuildQuery(
            entityKey, search, includeArchived, publishedOnly, requiredRight, bypassAcl);

        return await ProjectList(query).ToListAsync(cancellationToken);
    }

    private IQueryable<CrystalReport> BuildQuery(
        string? entityKey, string? search, bool includeArchived, bool publishedOnly,
        CrystalReportRight? requiredRight, bool bypassAcl)
    {
        var query = context.CrystalReports.AsNoTracking();
        if (!includeArchived)
            query = query.Where(x => !x.IsDeleted);
        if (publishedOnly)
            query = query.Where(x => x.CurrentPublishedVersionId != null && !x.IsDeleted);
        if (!string.IsNullOrWhiteSpace(entityKey))
        {
            var normalized = entityKey.Trim().ToLowerInvariant();
            query = query.Where(x => x.EntityKey == normalized);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.DisplayName.Contains(term) ||
                                     x.ReportKey.Contains(term) ||
                                     (x.Description != null && x.Description.Contains(term)));
        }
        if (!bypassAcl && requiredRight.HasValue)
        {
            var userId = currentActor.UserId ?? string.Empty;
            var roleIds = context.UserRoles.AsNoTracking()
                .Where(x => x.UserId == userId)
                .Select(x => x.RoleId);
            var right = requiredRight.Value;
            query = query.Where(report => context.CrystalReportRoleGrants.Any(grant =>
                !grant.IsDeleted && grant.CrystalReportId == report.Id &&
                roleIds.Contains(grant.RoleId) && (grant.Rights & right) == right));
        }

        return query;
    }

    private IQueryable<CrystalReportListItemResponse> ProjectList(IQueryable<CrystalReport> query) =>
        query
            .OrderBy(x => x.EntityKey).ThenBy(x => x.DisplayName).ThenBy(x => x.Id)
            .Select(x => new CrystalReportListItemResponse(
                x.Id, x.EntityKey, x.ReportKey, x.DisplayName,
                context.CrystalReportVersions
                    .Where(v => v.Id == x.CurrentPublishedVersionId)
                    .Select(v => v.SummaryTitle).FirstOrDefault(),
                context.CrystalReportVersions
                    .Where(v => v.Id == x.CurrentPublishedVersionId)
                    .Select(v => v.SummarySubject).FirstOrDefault(),
                x.Description,
                context.CrystalReportVersions
                    .Where(v => v.Id == x.CurrentPublishedVersionId)
                    .Select(v => (int?)v.VersionNumber).FirstOrDefault(),
                x.CurrentPublishedVersionId != null, x.IsDeleted,
                Convert.ToBase64String(x.RowVersion), x.UpdatedOn));

    public async Task<CrystalReportDetailResponse?> GetDetailAsync(
        Guid id, bool includeArchived, CrystalReportRight? requiredRight,
        bool bypassAcl, CancellationToken cancellationToken)
    {
        var report = await context.CrystalReports.AsNoTracking()
            .Where(x => x.Id == id && (includeArchived || !x.IsDeleted))
            .Select(x => new
            {
                x.Id, x.EntityKey, x.ReportKey, x.DisplayName, x.Description,
                x.CurrentPublishedVersionId, x.IsDeleted, x.RowVersion,
                x.CreatedOn, x.UpdatedOn
            }).FirstOrDefaultAsync(cancellationToken);
        if (report is null || (!bypassAcl && requiredRight.HasValue &&
            !await HasRightAsync(id, requiredRight.Value, cancellationToken)))
            return null;

        var versions = await context.CrystalReportVersions.AsNoTracking()
            .Where(x => x.CrystalReportId == id)
            .OrderByDescending(x => x.VersionNumber)
            .Select(x => new CrystalReportVersionResponse(
                x.Id, x.VersionNumber, x.OriginalFileName, x.Size, x.Sha256,
                x.SummaryTitle, x.SummarySubject, x.ValidationStatus.ToString(),
                x.ValidationReason, x.Id == report.CurrentPublishedVersionId, x.CreatedOn))
            .ToListAsync(cancellationToken);
        var grants = await GetGrantsAsync(id, cancellationToken);
        var currentVersion = versions.FirstOrDefault(x => x.IsPublished)?.VersionNumber;
        return new CrystalReportDetailResponse(
            report.Id, report.EntityKey, report.ReportKey, report.DisplayName,
            report.Description, currentVersion, report.CurrentPublishedVersionId.HasValue,
            report.IsDeleted, Convert.ToBase64String(report.RowVersion),
            report.CreatedOn, report.UpdatedOn, versions, grants);
    }

    public Task<CrystalReport?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken) =>
        context.CrystalReports.Include(x => x.RoleGrants)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<CrystalReportVersion?> GetVersionAsync(
        Guid reportId, Guid versionId, CancellationToken cancellationToken) =>
        context.CrystalReportVersions.FirstOrDefaultAsync(
            x => x.CrystalReportId == reportId && x.Id == versionId, cancellationToken);

    public async Task<int> GetNextVersionNumberAsync(Guid reportId, CancellationToken cancellationToken) =>
        (await context.CrystalReportVersions
            .Where(x => x.CrystalReportId == reportId)
            .MaxAsync(x => (int?)x.VersionNumber, cancellationToken) ?? 0) + 1;

    public Task<bool> ReportKeyExistsAsync(
        string entityKey, string reportKey, CancellationToken cancellationToken) =>
        context.CrystalReports.AnyAsync(x =>
            x.EntityKey == entityKey && x.ReportKey == reportKey, cancellationToken);

    public async Task<IReadOnlyList<CrystalReportIdentity>> ListIdentitiesAsync(
        CancellationToken cancellationToken) =>
        await context.CrystalReports.AsNoTracking()
            .Select(x => new CrystalReportIdentity(x.EntityKey, x.ReportKey))
            .ToListAsync(cancellationToken);

    public Task<bool> HasRightAsync(
        Guid reportId, CrystalReportRight right, CancellationToken cancellationToken)
    {
        var userId = currentActor.UserId ?? string.Empty;
        var roleIds = context.UserRoles.AsNoTracking()
            .Where(x => x.UserId == userId).Select(x => x.RoleId);
        return context.CrystalReportRoleGrants.AsNoTracking().AnyAsync(x =>
            !x.IsDeleted && x.CrystalReportId == reportId &&
            roleIds.Contains(x.RoleId) && (x.Rights & right) == right,
            cancellationToken);
    }

    public async Task<IReadOnlyList<CrystalReportRoleGrantResponse>> GetGrantsAsync(
        Guid reportId, CancellationToken cancellationToken)
    {
        var values = await (from grant in context.CrystalReportRoleGrants.AsNoTracking()
                            join role in context.Roles.AsNoTracking() on grant.RoleId equals role.Id
                            where grant.CrystalReportId == reportId && !grant.IsDeleted
                            orderby role.Name
                            select new { grant.RoleId, RoleName = role.Name!, grant.Rights })
            .ToListAsync(cancellationToken);
        return values.Select(x => new CrystalReportRoleGrantResponse(
            x.RoleId, x.RoleName, ToRightNames(x.Rights))).ToArray();
    }

    public async Task<bool> AreGrantRolesValidAsync(
        IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken)
    {
        if (roleIds.Count == 0)
            return true;
        var distinct = roleIds.Distinct(StringComparer.Ordinal).ToArray();
        var tenantId = currentActor.TenantId;
        var count = await context.Roles.AsNoTracking().CountAsync(role =>
            distinct.Contains(role.Id) && !role.IsDeleted &&
            (role.TenantId == tenantId ||
             role.IsSystem && role.NormalizedName == AppRoles.admin.ToUpper()),
            cancellationToken);
        return count == distinct.Length;
    }

    public async Task<CrystalReportVersion?> GetDownloadVersionAsync(
        Guid reportId, Guid? versionId, CancellationToken cancellationToken)
    {
        var report = await context.CrystalReports.AsNoTracking()
            .Where(x => x.Id == reportId && !x.IsDeleted)
            .Select(x => new { x.CurrentPublishedVersionId })
            .FirstOrDefaultAsync(cancellationToken);
        if (report is null)
            return null;
        var selectedId = versionId ?? report.CurrentPublishedVersionId;
        if (!selectedId.HasValue)
            return null;
        return await context.CrystalReportVersions.AsNoTracking().FirstOrDefaultAsync(
            x => x.CrystalReportId == reportId && x.Id == selectedId.Value,
            cancellationToken);
    }

    public void Add(CrystalReport report) => context.CrystalReports.Add(report);
    public void AddVersion(CrystalReportVersion version) => context.CrystalReportVersions.Add(version);

    public void ReplaceGrants(
        CrystalReport report, IReadOnlyCollection<CrystalReportRoleGrant> grants)
    {
        foreach (var existing in report.RoleGrants.Where(x => !x.IsDeleted).ToArray())
            context.CrystalReportRoleGrants.Remove(existing);
        context.CrystalReportRoleGrants.AddRange(grants);
    }

    public void ApplyOriginalRowVersion(CrystalReport report, byte[] rowVersion) =>
        context.Entry(report).Property(x => x.RowVersion).OriginalValue = rowVersion;

    private static IReadOnlyList<string> ToRightNames(CrystalReportRight rights) =>
        Enum.GetValues<CrystalReportRight>()
            .Where(value => value != CrystalReportRight.None && rights.HasFlag(value))
            .Select(value => value.ToString()).ToArray();
}
