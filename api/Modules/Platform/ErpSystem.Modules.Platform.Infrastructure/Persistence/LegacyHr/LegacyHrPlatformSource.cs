using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.SessionValidation;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Persistence.LegacyHr;

/// <summary>
/// Platform-owned persistence adapter over the legacy HR schema. These tables stay
/// physically in schema <c>hr</c> for compatibility, but Platform no longer needs an
/// HR assembly/service at runtime to enforce tenant, entitlement and session policy.
/// </summary>
internal sealed class LegacyHrPlatformSource(PlatformDbContext db) :
    ITenantAccessSource,
    ITenantMembershipSource,
    ICompanyAccessSource,
    ISessionValidationSource,
    IAccessTokenClaimMaterialSource,
    ITenantModuleEntitlementSource
{
    private const string PermissionClaimType = "Permissions";
    private const string SuperAdminNormalizedRole = "SUPER_ADMIN";

    async Task<TenantAccessSnapshot?> ITenantAccessSource.GetAsync(
        string tenantId,
        CancellationToken cancellationToken)
    {
        var tenant = await db.Set<LegacyTenantRow>()
            .AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == tenantId, cancellationToken);
        return tenant is null
            ? null
            : new TenantAccessSnapshot(
                tenant.Name,
                tenant.PlanName,
                ParseSubscriptionStatus(tenant.SubscriptionStatus),
                tenant.SubscriptionEndsOn);
    }

    async Task<IReadOnlyList<TenantMembershipSnapshot>> ITenantMembershipSource.GetAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await (
            from access in db.Set<LegacyUserTenantAccessRow>().AsNoTracking()
            join tenant in db.Set<LegacyTenantRow>().AsNoTracking()
                on access.TenantId equals tenant.Id
            where access.UserId == userId
            select new
            {
                access.TenantId,
                tenant.Identifier,
                tenant.Name,
                access.IsDefault,
                tenant.IsActive,
                tenant.SubscriptionStatus
            }).ToArrayAsync(cancellationToken);

        return rows.Select(row => new TenantMembershipSnapshot(
            row.TenantId,
            row.Identifier,
            row.Name,
            row.IsDefault,
            row.IsActive,
            ParseSubscriptionStatus(row.SubscriptionStatus))).ToArray();
    }

    async Task<IReadOnlyList<CompanyAccessSnapshot>> ICompanyAccessSource.GetAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken)
    {
        var rows = await (
            from access in db.Set<LegacyUserCompanyAccessRow>().AsNoTracking()
            join company in db.Set<LegacyCompanyRow>().AsNoTracking()
                on new { access.TenantId, access.CompanyId }
                equals new { company.TenantId, CompanyId = company.Id }
            where access.UserId == userId && access.TenantId == tenantId
            orderby access.IsDefault descending, company.NameEn
            select new CompanyAccessSnapshot(
                company.Id,
                company.CompanyCode,
                company.NameAr,
                company.NameEn,
                access.IsDefault,
                company.IsActive)).ToArrayAsync(cancellationToken);

        return rows;
    }

    async Task<SessionValidationSnapshot?> ISessionValidationSource.GetAsync(
        string userId,
        string sessionId,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken)
    {
        var user = await db.Set<LegacyIdentityUserRow>()
            .AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == userId, cancellationToken);
        if (user is null)
            return null;

        var tenant = await db.Set<LegacyTenantRow>()
            .AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == tenantId, cancellationToken);
        var hasTenantMembership = await db.Set<LegacyUserTenantAccessRow>()
            .AsNoTracking()
            .AnyAsync(row => row.UserId == userId && row.TenantId == tenantId, cancellationToken);

        var company = await (
            from access in db.Set<LegacyUserCompanyAccessRow>().AsNoTracking()
            join candidate in db.Set<LegacyCompanyRow>().AsNoTracking()
                on new { access.TenantId, access.CompanyId }
                equals new { candidate.TenantId, CompanyId = candidate.Id }
            where access.UserId == userId &&
                  access.TenantId == tenantId &&
                  access.CompanyId == companyId
            select new { candidate.IsActive }).SingleOrDefaultAsync(cancellationToken);

        var sessions = await db.Set<LegacyRefreshSessionRow>()
            .AsNoTracking()
            .Where(row => row.ApplicationUserId == userId &&
                          row.SessionId == sessionId &&
                          row.CompanyId == companyId)
            .Select(row => new RefreshSessionSnapshot(
                row.SessionId,
                row.CompanyId,
                row.ExpiresOn,
                row.RevokedOn))
            .ToArrayAsync(cancellationToken);

        return new SessionValidationSnapshot(
            user.IsDisabled,
            user.LockoutEnd,
            user.SecurityStamp,
            hasTenantMembership,
            tenant?.IsActive == true,
            tenant is null ? null : ParseSubscriptionStatus(tenant.SubscriptionStatus),
            company is not null,
            company?.IsActive == true,
            sessions);
    }

    async Task<AccessTokenClaimMaterialSourceSnapshot> IAccessTokenClaimMaterialSource.GetAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken)
    {
        var tenant = await db.Set<LegacyTenantRow>()
            .AsNoTracking()
            .Where(row => row.Id == tenantId)
            .Select(row => new AccessTokenTenantSnapshot(row.Id, row.Name, row.PlanName))
            .SingleOrDefaultAsync(cancellationToken);

        var roles = await (
            from userRole in db.Set<LegacyUserRoleRow>().AsNoTracking()
            join role in db.Set<LegacyRoleRow>().AsNoTracking() on userRole.RoleId equals role.Id
            where userRole.UserId == userId
            select new AccessTokenRoleSnapshot(
                role.Id,
                role.Name ?? string.Empty,
                role.TenantId,
                role.IsSystem,
                role.IsDeleted)).ToArrayAsync(cancellationToken);

        var roleIds = roles.Select(role => role.Id).ToArray();
        var roleClaims = roleIds.Length == 0
            ? []
            : await db.Set<LegacyRoleClaimRow>()
                .AsNoTracking()
                .Where(row => roleIds.Contains(row.RoleId))
                .Select(row => new AccessTokenRoleClaimSnapshot(
                    row.RoleId,
                    row.ClaimType,
                    row.ClaimValue))
                .ToArrayAsync(cancellationToken);

        return new AccessTokenClaimMaterialSourceSnapshot(tenant, roles, roleClaims);
    }

    public async Task ApplyAsync(
        string tenantId,
        IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
        CancellationToken cancellationToken = default)
    {
        var normalized = entitlements
            .Where(item => !string.IsNullOrWhiteSpace(item.ModuleCode))
            .Select(item => new
            {
                ModuleCode = item.ModuleCode.Trim().ToLowerInvariant(),
                Submodules = (item.SubmoduleCodes ?? [])
                    .Where(code => !string.IsNullOrWhiteSpace(code))
                    .Select(code => code.Trim().ToLowerInvariant())
                    .Distinct(StringComparer.Ordinal)
                    .ToArray()
            })
            .GroupBy(item => item.ModuleCode, StringComparer.Ordinal)
            .ToDictionary(
                group => group.Key,
                group => group.SelectMany(item => item.Submodules)
                    .Distinct(StringComparer.Ordinal)
                    .ToArray(),
                StringComparer.Ordinal);

        var modules = await db.Set<LegacyTenantModuleEntitlementRow>()
            .Where(row => row.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);
        var submodules = await db.Set<LegacyTenantSubmoduleEntitlementRow>()
            .Where(row => row.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

        var desiredSubmodules = normalized
            .SelectMany(item => item.Value.Select(submodule => (item.Key, submodule)))
            .ToHashSet();
        db.RemoveRange(submodules.Where(row =>
            !desiredSubmodules.Contains((row.ModuleCode, row.SubmoduleCode))));
        db.RemoveRange(modules.Where(row => !normalized.ContainsKey(row.ModuleCode)));

        var existingModules = modules.Select(row => row.ModuleCode).ToHashSet(StringComparer.Ordinal);
        var existingSubmodules = submodules
            .Select(row => (row.ModuleCode, row.SubmoduleCode))
            .ToHashSet();
        foreach (var item in normalized)
        {
            if (!existingModules.Contains(item.Key))
            {
                db.Add(new LegacyTenantModuleEntitlementRow
                {
                    TenantId = tenantId,
                    ModuleCode = item.Key
                });
            }

            foreach (var submodule in item.Value)
            {
                if (!existingSubmodules.Contains((item.Key, submodule)))
                {
                    db.Add(new LegacyTenantSubmoduleEntitlementRow
                    {
                        TenantId = tenantId,
                        ModuleCode = item.Key,
                        SubmoduleCode = submodule
                    });
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    public Task<bool> HasAccessAsync(
        string tenantId,
        string moduleCode,
        string submoduleCode,
        CancellationToken cancellationToken = default) =>
        db.Set<LegacyTenantSubmoduleEntitlementRow>()
            .AsNoTracking()
            .AnyAsync(row => row.TenantId == tenantId &&
                             row.ModuleCode == moduleCode.Trim().ToLowerInvariant() &&
                             row.SubmoduleCode == submoduleCode.Trim().ToLowerInvariant(), cancellationToken);

    public async Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var modules = await db.Set<LegacyTenantModuleEntitlementRow>()
            .AsNoTracking()
            .Where(row => row.TenantId == tenantId)
            .OrderBy(row => row.ModuleCode)
            .ToArrayAsync(cancellationToken);
        var submodules = await db.Set<LegacyTenantSubmoduleEntitlementRow>()
            .AsNoTracking()
            .Where(row => row.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

        return modules.Select(module => new TenantModuleEntitlementResponse(
            module.ModuleCode,
            submodules
                .Where(row => row.ModuleCode == module.ModuleCode)
                .Select(row => row.SubmoduleCode)
                .OrderBy(code => code)
                .ToArray())).ToArray();
    }

    public Task<bool> UserHasPermissionAsync(
        string userId,
        string tenantId,
        string permission,
        CancellationToken cancellationToken = default) =>
        (from userRole in db.Set<LegacyUserRoleRow>().AsNoTracking()
         join role in db.Set<LegacyRoleRow>().AsNoTracking() on userRole.RoleId equals role.Id
         join claim in db.Set<LegacyRoleClaimRow>().AsNoTracking() on role.Id equals claim.RoleId
         where userRole.UserId == userId &&
               claim.ClaimType == PermissionClaimType &&
               claim.ClaimValue == permission &&
               (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId))
         select role.Id).AnyAsync(cancellationToken);

    public async Task<IReadOnlySet<string>> GetUserPermissionsAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var permissions = await (
            from userRole in db.Set<LegacyUserRoleRow>().AsNoTracking()
            join role in db.Set<LegacyRoleRow>().AsNoTracking() on userRole.RoleId equals role.Id
            join claim in db.Set<LegacyRoleClaimRow>().AsNoTracking() on role.Id equals claim.RoleId
            where userRole.UserId == userId &&
                  claim.ClaimType == PermissionClaimType &&
                  claim.ClaimValue != null &&
                  (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId))
            select claim.ClaimValue!).Distinct().ToArrayAsync(cancellationToken);

        return permissions.ToHashSet(StringComparer.Ordinal);
    }

    public Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        (from userRole in db.Set<LegacyUserRoleRow>().AsNoTracking()
         join role in db.Set<LegacyRoleRow>().AsNoTracking() on userRole.RoleId equals role.Id
         where userRole.UserId == userId &&
               role.IsSystem &&
               role.NormalizedName == SuperAdminNormalizedRole
         select role.Id).AnyAsync(cancellationToken);

    private static TenantSubscriptionStatus ParseSubscriptionStatus(string value) =>
        Enum.TryParse<TenantSubscriptionStatus>(value, ignoreCase: true, out var status) && Enum.IsDefined(status)
            ? status
            : throw new InvalidOperationException($"Unknown tenant subscription status '{value}'.");
}
