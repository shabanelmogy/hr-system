using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class GlobalCrystalReportAccessStore(ReportingDbContext context, ICurrentActor actor,
    IPlatformAuthorizationSource roles) : IGlobalCrystalReportAccessStore
{
    public Task<PlatformRoleScopePage> RolesAsync(string? search, int page, int pageSize, CancellationToken token) =>
        roles.GetRoleScopesPageAsync(search, page, pageSize, token);

    public async Task<bool> RolesValidAsync(IReadOnlyCollection<string> roleIds, CancellationToken token) =>
        (await roles.GetRoleScopesAsync(roleIds, token)).Count == roleIds.Distinct(StringComparer.Ordinal).Count();

    public async Task<IReadOnlyList<CrystalReportRoleGrantResponse>> GrantsAsync(Guid reportId, CancellationToken token)
    {
        var grants = await context.GlobalCrystalReportRoleGrants.AsNoTracking()
            .Where(grant => grant.GlobalCrystalReportId == reportId && !grant.IsDeleted)
            .OrderBy(grant => grant.RoleId).ToArrayAsync(token);
        var names = (await roles.GetRoleScopesAsync(grants.Select(grant => grant.RoleId).ToArray(), token))
            .ToDictionary(role => role.Id, role => role.TenantName == null ? role.Name : role.TenantName + " / " + role.Name);
        return grants.Select(grant => new CrystalReportRoleGrantResponse(grant.RoleId,
            names.GetValueOrDefault(grant.RoleId, grant.RoleId), RightNames(grant.Rights))).ToArray();
    }

    public async Task<bool> HasRightAsync(Guid reportId, CrystalReportRight right, CancellationToken token)
    {
        var current = await CurrentRoleIdsAsync(token);
        return await context.GlobalCrystalReportRoleGrants.AsNoTracking()
            .IgnoreQueryFilters(["GlobalActorFilter"])
            .AnyAsync(grant => !grant.IsDeleted && grant.GlobalCrystalReportId == reportId &&
                current.Contains(grant.RoleId) && (grant.Rights & right) == right, token);
    }

    public async Task<IReadOnlyList<Guid>> GrantedReportIdsAsync(CrystalReportRight right, CancellationToken token)
    {
        var current = await CurrentRoleIdsAsync(token);
        return await context.GlobalCrystalReportRoleGrants.AsNoTracking().IgnoreQueryFilters(["GlobalActorFilter"])
            .Where(grant => !grant.IsDeleted && current.Contains(grant.RoleId) && (grant.Rights & right) == right)
            .Select(grant => grant.GlobalCrystalReportId).Distinct().Take(10001).ToArrayAsync(token);
    }

    private async Task<string[]> CurrentRoleIdsAsync(CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(actor.UserId)) return [];
        var assigned = await roles.GetUserRoleIdsAsync(actor.UserId, token);
        var eligible = await roles.GetAssignableRolesAsync(actor.TenantId, token);
        return assigned.Intersect(eligible.Select(role => role.Id), StringComparer.Ordinal).ToArray();
    }

    public async Task ReplaceAsync(Guid reportId, IReadOnlyList<GlobalCrystalReportRoleGrant> grants, CancellationToken token)
    {
        var current = await context.GlobalCrystalReportRoleGrants
            .Where(grant => grant.GlobalCrystalReportId == reportId && !grant.IsDeleted).ToArrayAsync(token);
        context.GlobalCrystalReportRoleGrants.RemoveRange(current);
        context.GlobalCrystalReportRoleGrants.AddRange(grants);
    }

    internal static IReadOnlyList<string> RightNames(CrystalReportRight rights) =>
        Enum.GetValues<CrystalReportRight>().Where(right => right != CrystalReportRight.None && (rights & right) == right)
            .Select(right => right.ToString()).ToArray();
}

/// <summary>Only published, active, explicitly granted global sources cross this boundary.
/// The named global administrator filter is disabled; tenant/company filters are never disabled.</summary>
public sealed class GlobalCrystalReportConsumptionStore(ReportingDbContext context,
    GlobalCrystalReportConsumerPolicy policy, IGlobalCrystalReportAccessStore access) : IGlobalCrystalReportConsumptionStore
{
    public async Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entityKey,
        CrystalReportRight right, CancellationToken token)
    {
        if (right is not (CrystalReportRight.Run or CrystalReportRight.Download) ||
            !policy.Allows(entityKey, right == CrystalReportRight.Download)) return [];
        var grantedIds = await access.GrantedReportIdsAsync(right, token);
        if (grantedIds.Count > 10000) throw new InvalidOperationException("The global access catalog exceeds its bounded limit.");
        var reports = await context.GlobalCrystalReports.AsNoTracking().IgnoreQueryFilters(["GlobalActorFilter"])
            .Where(report => grantedIds.Contains(report.Id) && report.EntityKey == entityKey && !report.IsDeleted && report.CurrentPublishedVersionId != null)
            .OrderBy(report => report.ReportKey).Select(report => new { report.Id, report.ReportKey, report.DisplayName,
                report.Description, report.CurrentPublishedVersionId, report.UpdatedOn, report.ViewName, report.ViewFingerprint }).Take(10001).ToArrayAsync(token);
        if (reports.Length > 10000) throw new InvalidOperationException("The global report catalog exceeds its bounded limit.");
        var versionIds = reports.Select(report => report.CurrentPublishedVersionId!.Value).ToArray();
        var versions = await context.GlobalCrystalReportVersions.AsNoTracking().IgnoreQueryFilters(["GlobalActorFilter"])
            .Where(version => versionIds.Contains(version.Id)).ToDictionaryAsync(version => version.Id, token);
        var allowed = new List<GlobalCrystalManagedCatalogEntry>();
        foreach (var report in reports)
        {
            var version = versions.GetValueOrDefault(report.CurrentPublishedVersionId!.Value);
            if (version?.GlobalCrystalReportId == report.Id) allowed.Add(new GlobalCrystalManagedCatalogEntry(report.Id, entityKey, report.ReportKey,
                report.DisplayName, report.Description, version, report.UpdatedOn)
                { ViewName = report.ViewName, ViewFingerprint = report.ViewFingerprint });
        }
        return allowed;
    }
}
