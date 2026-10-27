using ErpSystem.Modules.Platform.Application.Features.Security.UserPermissions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Domain.Security.Users.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums;
using System.Text.Json;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.UserPermissions;

public sealed class UserCompanyPermissionsStore(
    PlatformDbContext db, ICurrentActor actor, AuthCompanyAccessService companyAccess,
    IModuleCatalogPolicy catalog, IRoleLockResourceFactory locks, TimeProvider timeProvider,
    UserPermissionErrors errors) : IUserCompanyPermissionsStore
{
    public async Task<UserCompanyPermissionsResponse?> GetAsync(
        string userId, string tenantId, int companyId, CancellationToken cancellationToken = default)
    {
        if (!MatchesActor(tenantId, companyId) || !await TargetExistsAsync(userId, tenantId, companyId, cancellationToken))
            return null;
        var userName = await db.Users.AsNoTracking().Where(user => user.Id == userId)
            .Select(user => user.UserName ?? user.Id).SingleAsync(cancellationToken);
        var companyName = await db.Companies.AsNoTracking().Where(company => company.Id == companyId)
            .Select(company => company.NameEn).SingleAsync(cancellationToken);
        var set = await db.UserCompanyPermissionGrantSets.AsNoTracking().Include(item => item.Grants)
            .SingleOrDefaultAsync(item => item.UserId == userId, cancellationToken);
        var direct = (set?.Grants ?? []).Select(item => item.Permission).ToHashSet(StringComparer.Ordinal);
        var inherited = await (from assignment in db.UserRoles.AsNoTracking()
            join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
            join claim in db.RoleClaims.AsNoTracking() on role.Id equals claim.RoleId
            where assignment.UserId == userId && claim.ClaimType == PermissionClaimNames.Permission &&
                claim.ClaimValue != null && (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId))
            select new { Permission = claim.ClaimValue!, RoleName = role.Name ?? role.Id }).ToArrayAsync(cancellationToken);
        var actorPermissions = await new PlatformContractSource(db).GetUserPermissionsAsync(actor.UserId!, tenantId, cancellationToken);
        var entitlements = await db.TenantSubmoduleEntitlements.AsNoTracking().ToArrayAsync(cancellationToken);
        var all = catalog.GetTenantAssignablePermissions().Concat(direct).Concat(inherited.Select(item => item.Permission))
            .Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal);
        var rows = all.Select(permission =>
        {
            var known = catalog.TryResolvePermission(permission, out var metadata);
            var roles = inherited.Where(item => item.Permission == permission).Select(item => item.RoleName)
                .Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
            var canGrant = known && metadata.RequiresTenantEntitlement && actorPermissions.Contains(permission) &&
                entitlements.Any(item => item.ModuleCode == metadata.ModuleCode && item.SubmoduleCode == metadata.SubmoduleCode);
            return new UserCompanyPermissionItem(permission, known ? metadata.ModuleCode : string.Empty,
                known ? metadata.SubmoduleCode : string.Empty, direct.Contains(permission), roles,
                roles.Length > 0 || direct.Contains(permission), canGrant);
        }).ToArray();
        return new(userId, userName, companyId, companyName, set?.Revision ?? 0, rows);
    }

    public async Task<Result<UserCompanyPermissionMutation>> ReplaceAsync(
        string userId, string tenantId, int companyId, IReadOnlyCollection<string> permissions,
        int revision, CancellationToken cancellationToken = default)
    {
        if (!MatchesActor(tenantId, companyId))
            return Result.Failure<UserCompanyPermissionMutation>(errors.NotFound);
        try
        {
            // A user-wide lock also serializes stamp changes made from different companies.
            return await db.ExecuteAtomicallyAsync([locks.Create(tenantId, "user-permissions:" + userId)], async token =>
            {
                if (!await TargetExistsAsync(userId, tenantId, companyId, token))
                    return Result.Failure<UserCompanyPermissionMutation>(errors.NotFound);
                var set = await db.UserCompanyPermissionGrantSets.Include(item => item.Grants)
                    .SingleOrDefaultAsync(item => item.UserId == userId, token);
                if ((set?.Revision ?? 0) != revision)
                    return Result.Failure<UserCompanyPermissionMutation>(errors.Conflict);
                var previous = (set?.Grants ?? []).Select(item => item.Permission).ToHashSet(StringComparer.Ordinal);
                var desired = permissions.ToHashSet(StringComparer.Ordinal);
                if (permissions.Count > 2000 || desired.Count != permissions.Count ||
                    permissions.Any(permission => string.IsNullOrWhiteSpace(permission) || permission.Length > 200 ||
                        permission != permission.Trim()))
                    return Result.Failure<UserCompanyPermissionMutation>(errors.Invalid);
                if (previous.SetEquals(desired))
                    return Result.Success(new UserCompanyPermissionMutation(false, revision));
                var actorPermissions = await new PlatformContractSource(db).GetUserPermissionsAsync(actor.UserId!, tenantId, token);
                foreach (var permission in desired.Except(previous, StringComparer.Ordinal))
                {
                    if (!catalog.TryResolvePermission(permission, out var metadata) || !metadata.RequiresTenantEntitlement)
                        return Result.Failure<UserCompanyPermissionMutation>(errors.Invalid);
                    if (!actorPermissions.Contains(permission) || !await db.TenantSubmoduleEntitlements
                        .AnyAsync(item => item.ModuleCode == metadata.ModuleCode && item.SubmoduleCode == metadata.SubmoduleCode, token))
                        return Result.Failure<UserCompanyPermissionMutation>(errors.Forbidden);
                }
                if (set is null)
                {
                    set = new UserCompanyPermissionGrantSet(tenantId, companyId, userId);
                    db.UserCompanyPermissionGrantSets.Add(set);
                }
                set.Replace(permissions, revision);
                var now = timeProvider.GetUtcNow().UtcDateTime;
                var target = await db.Users.Include(user => user.RefreshTokens).SingleAsync(user => user.Id == userId, token);
                target.SecurityStamp = Guid.NewGuid().ToString("N");
                target.ConcurrencyStamp = Guid.NewGuid().ToString("N");
                foreach (var refresh in target.RefreshTokens.Where(item => item.IsActiveAt(now)))
                    refresh.Revoke("Company permissions changed", now);
                db.SecurityAuditEvents.Add(new SecurityAuditEvent(Guid.NewGuid(), "UserCompanyPermissionsUpdated",
                    "PlatformApplicationUser", SecurityAuditOutcome.Succeeded, now, tenantId, companyId, actor.UserId,
                    userId, null, null, null, actor.CorrelationId,
                    JsonSerializer.Serialize(new { Previous = previous.Order(StringComparer.Ordinal), Current = desired.Order(StringComparer.Ordinal), set.Revision })));
                await db.SaveChangesAsync(token);
                return Result.Success(new UserCompanyPermissionMutation(true, set.Revision));
            }, cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            db.ChangeTracker.Clear();
            return Result.Failure<UserCompanyPermissionMutation>(errors.Conflict);
        }
    }

    private bool MatchesActor(string tenantId, int companyId) =>
        !string.IsNullOrWhiteSpace(actor.UserId) && companyId > 0 && actor.CompanyId == companyId &&
        string.Equals(actor.TenantId, tenantId, StringComparison.Ordinal);

    private async Task<bool> TargetExistsAsync(string userId, string tenantId, int companyId, CancellationToken token) =>
        await db.Users.AsNoTracking().AnyAsync(user => user.Id == userId && !user.IsDisabled && user.ArchivedOn == null, token) &&
        await db.UserTenantAccesses.AsNoTracking().AnyAsync(access => access.UserId == userId, token) &&
        await db.UserCompanyAccesses.AsNoTracking().AnyAsync(access => access.UserId == userId, token) &&
        await db.Companies.AsNoTracking().AnyAsync(company => company.Id == companyId && company.IsActive, token) &&
        await companyAccess.IsUserWithinActorCompanyScopeAsync(userId, tenantId, token);
}