using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

/// <summary>Physical Platform owner for identity, tenant, company and entitlement ports.</summary>
public sealed class PlatformContractSource(PlatformDbContext db) :
    ITenantAccessSource,
    ITenantMembershipSource,
    ICompanyAccessSource,
    ISessionValidationSource,
    IAccessTokenClaimMaterialSource,
    ITenantModuleEntitlementSource,
    ISelectionChallengeSource
{
    async Task<TenantAccessSnapshot?> ITenantAccessSource.GetAsync(string tenantId, CancellationToken token)
    {
        var tenant = await db.Tenants.AsNoTracking().SingleOrDefaultAsync(item => item.Id == tenantId, token);
        return tenant is null ? null : new TenantAccessSnapshot(
            tenant.Name, tenant.PlanName, (TenantSubscriptionStatus)tenant.SubscriptionStatus,
            tenant.SubscriptionEndsOn);
    }

    async Task<IReadOnlyList<TenantMembershipSnapshot>> ITenantMembershipSource.GetAsync(string userId, CancellationToken token)
    {
        var rows = await (from access in db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
                          join tenant in db.Tenants.AsNoTracking() on access.TenantId equals tenant.Id
                          where access.UserId == userId
                          select new { access.TenantId, tenant.Identifier, tenant.Name, access.IsDefault, tenant.IsActive, tenant.SubscriptionStatus })
            .ToArrayAsync(token);
        return rows.Select(row => new TenantMembershipSnapshot(row.TenantId, row.Identifier, row.Name,
            row.IsDefault, row.IsActive, (TenantSubscriptionStatus)row.SubscriptionStatus)).ToArray();
    }

    async Task<IReadOnlyList<CompanyAccessSnapshot>> ICompanyAccessSource.GetAsync(string userId, string tenantId, CancellationToken token)
    {
        return await (from access in db.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking()
                      join company in db.Companies.IgnoreQueryFilters().AsNoTracking() on new { access.TenantId, access.CompanyId }
                          equals new { company.TenantId, CompanyId = company.Id }
                      where access.UserId == userId && access.TenantId == tenantId
                      orderby access.IsDefault descending, company.NameEn
                      select new CompanyAccessSnapshot(company.Id, company.CompanyCode, company.NameAr,
                          company.NameEn, access.IsDefault, company.IsActive)).ToArrayAsync(token);
    }

    async Task<SessionValidationSnapshot?> ISessionValidationSource.GetAsync(
        string userId, string sessionId, string tenantId, int companyId, CancellationToken token)
    {
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(item => item.Id == userId, token);
        if (user is null) return null;
        var tenant = await db.Tenants.AsNoTracking().SingleOrDefaultAsync(item => item.Id == tenantId, token);
        var hasMembership = await db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
            .AnyAsync(item => item.UserId == userId && item.TenantId == tenantId, token);
        var companyAccess = await (from access in db.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking()
                                join company in db.Companies.IgnoreQueryFilters().AsNoTracking()
                                    on new { access.TenantId, access.CompanyId }
                                    equals new { company.TenantId, CompanyId = company.Id }
                                where access.UserId == userId && access.TenantId == tenantId && access.CompanyId == companyId
                                select new { company.IsActive }).SingleOrDefaultAsync(token);
        var sessions = await db.Users.AsNoTracking().Where(item => item.Id == userId)
            .SelectMany(item => item.RefreshTokens)
            .Where(item => item.SessionId == sessionId && item.CompanyId == companyId)
            .Select(item => new RefreshSessionSnapshot(item.SessionId, item.CompanyId, item.ExpiresOn, item.RevokedOn))
            .ToArrayAsync(token);
        return new SessionValidationSnapshot(user.IsDisabled, user.LockoutEnd, user.SecurityStamp,
            hasMembership, tenant?.IsActive == true,
            tenant is null ? null : (TenantSubscriptionStatus)tenant.SubscriptionStatus,
            companyAccess is not null, companyAccess?.IsActive == true, sessions);
    }

    async Task<AccessTokenClaimMaterialSourceSnapshot> IAccessTokenClaimMaterialSource.GetAsync(string userId, string tenantId, CancellationToken token)
    {
        var tenant = await db.Tenants.AsNoTracking().Where(item => item.Id == tenantId)
            .Select(item => new AccessTokenTenantSnapshot(item.Id, item.Name, item.PlanName)).SingleOrDefaultAsync(token);
        var roles = await (from assignment in db.UserRoles.AsNoTracking()
                           join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                           where assignment.UserId == userId
                           select new AccessTokenRoleSnapshot(role.Id, role.Name ?? string.Empty,
                               role.TenantId, role.IsSystem, role.IsDeleted)).ToArrayAsync(token);
        var roleIds = roles.Select(role => role.Id).ToArray();
        var claims = roleIds.Length == 0 ? [] : await db.RoleClaims.AsNoTracking()
            .Where(claim => roleIds.Contains(claim.RoleId))
            .Select(claim => new AccessTokenRoleClaimSnapshot(claim.RoleId, claim.ClaimType, claim.ClaimValue))
            .ToArrayAsync(token);
        return new AccessTokenClaimMaterialSourceSnapshot(tenant, roles, claims);
    }

    public async Task StoreAsync(SelectionChallengeSnapshot challenge, DateTime _, CancellationToken token)
    {
        db.AuthenticationSelectionChallenges.Add(new PlatformAuthenticationSelectionChallenge
        {
            JwtId = challenge.JwtId, UserId = challenge.UserId, Scope = challenge.Scope,
            TenantId = challenge.TenantId, CreatedOn = challenge.CreatedOn, ExpiresOn = challenge.ExpiresOn
        });
        await db.SaveChangesAsync(token);
    }

    public async Task<bool> ConsumeAsync(SelectionChallengeConsumeRequest request, DateTime utcNow, CancellationToken token)
    {
        var challenge = await db.AuthenticationSelectionChallenges.IgnoreQueryFilters()
            .SingleOrDefaultAsync(item => item.JwtId == request.JwtId && item.UserId == request.UserId &&
                                          item.Scope == request.Scope && item.TenantId == request.TenantId, token);
        if (challenge is null || challenge.ExpiresOn <= utcNow) return false;
        db.AuthenticationSelectionChallenges.Remove(challenge);
        await db.SaveChangesAsync(token);
        return true;
    }

    public async Task ApplyAsync(string tenantId, IReadOnlyCollection<TenantModuleEntitlementRequest> requests, CancellationToken token = default)
    {
        var desired = requests.Where(item => !string.IsNullOrWhiteSpace(item.ModuleCode))
            .Select(item => new { Module = item.ModuleCode.Trim().ToLowerInvariant(), Subs = (item.SubmoduleCodes ?? []).Where(code => !string.IsNullOrWhiteSpace(code)).Select(code => code.Trim().ToLowerInvariant()).Distinct().ToArray() })
            .GroupBy(item => item.Module).ToDictionary(group => group.Key, group => group.SelectMany(item => item.Subs).Distinct().ToArray());
        await ApplyEntitlementsAsync(tenantId, desired, token);
        await db.SaveChangesAsync(token);
    }

    private async Task ApplyEntitlementsAsync(string tenantId, Dictionary<string, string[]> desired, CancellationToken token)
    {
        var modules = await db.TenantModuleEntitlements.IgnoreQueryFilters().Where(item => item.TenantId == tenantId).ToArrayAsync(token);
        var subs = await db.TenantSubmoduleEntitlements.IgnoreQueryFilters().Where(item => item.TenantId == tenantId).ToArrayAsync(token);
        db.TenantSubmoduleEntitlements.RemoveRange(subs.Where(item => !desired.TryGetValue(item.ModuleCode, out var values) || !values.Contains(item.SubmoduleCode, StringComparer.Ordinal)));
        db.TenantModuleEntitlements.RemoveRange(modules.Where(item => !desired.ContainsKey(item.ModuleCode)));
        foreach (var pair in desired)
        {
            if (!modules.Any(item => item.ModuleCode == pair.Key)) db.TenantModuleEntitlements.Add(new PlatformTenantModuleEntitlement { TenantId = tenantId, ModuleCode = pair.Key });
            foreach (var sub in pair.Value)
                if (!subs.Any(item => item.ModuleCode == pair.Key && item.SubmoduleCode == sub))
                    db.TenantSubmoduleEntitlements.Add(new PlatformTenantSubmoduleEntitlement { TenantId = tenantId, ModuleCode = pair.Key, SubmoduleCode = sub });
        }
    }

    public Task<bool> HasAccessAsync(string tenantId, string moduleCode, string submoduleCode, CancellationToken token = default) =>
        db.TenantSubmoduleEntitlements.IgnoreQueryFilters().AnyAsync(item => item.TenantId == tenantId && item.ModuleCode == moduleCode.Trim().ToLower() && item.SubmoduleCode == submoduleCode.Trim().ToLower(), token);

    public async Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(string tenantId, CancellationToken token = default)
    {
        var modules = await db.TenantModuleEntitlements.IgnoreQueryFilters().AsNoTracking().Where(item => item.TenantId == tenantId).OrderBy(item => item.ModuleCode).ToArrayAsync(token);
        var subs = await db.TenantSubmoduleEntitlements.IgnoreQueryFilters().AsNoTracking().Where(item => item.TenantId == tenantId).ToArrayAsync(token);
        return modules.Select(module => new TenantModuleEntitlementResponse(module.ModuleCode, subs.Where(item => item.ModuleCode == module.ModuleCode).Select(item => item.SubmoduleCode).OrderBy(item => item).ToArray())).ToArray();
    }

    public Task<bool> UserHasPermissionAsync(string userId, string tenantId, string permission, CancellationToken token = default) =>
        (from assignment in db.UserRoles join role in db.Roles on assignment.RoleId equals role.Id join claim in db.RoleClaims on role.Id equals claim.RoleId
         where assignment.UserId == userId && claim.ClaimType == PermissionClaimNames.Permission && claim.ClaimValue == permission && (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId)) select role.Id).AnyAsync(token);

    public async Task<IReadOnlySet<string>> GetUserPermissionsAsync(string userId, string tenantId, CancellationToken token = default) =>
        (await (from assignment in db.UserRoles join role in db.Roles on assignment.RoleId equals role.Id join claim in db.RoleClaims on role.Id equals claim.RoleId
                where assignment.UserId == userId && claim.ClaimType == PermissionClaimNames.Permission && (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId)) select claim.ClaimValue)
            .Where(value => value != null)
            .Select(value => value!)
            .Distinct()
            .ToArrayAsync(token)).ToHashSet(StringComparer.Ordinal);

    public Task<bool> IsSuperAdminAsync(string userId, CancellationToken token = default) =>
        (from assignment in db.UserRoles join role in db.Roles on assignment.RoleId equals role.Id where assignment.UserId == userId && role.IsSystem && role.NormalizedName == "SUPER_ADMIN" select role.Id).AnyAsync(token);
}
