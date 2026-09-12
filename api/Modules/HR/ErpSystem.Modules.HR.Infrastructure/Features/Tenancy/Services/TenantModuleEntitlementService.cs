using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Services;
using ErpSystem.Modules.HR.Domain.Tenancy.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Tenancy.Services;

public sealed class TenantModuleEntitlementService(ApplicationDbContext context)
    : ITenantModuleEntitlementService
{
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
            .Select(group => new
            {
                ModuleCode = group.Key,
                Submodules = group.SelectMany(item => item.Submodules)
                    .Distinct(StringComparer.Ordinal)
                    .ToArray()
            })
            .ToDictionary(item => item.ModuleCode, item => item.Submodules, StringComparer.Ordinal);

        var existingModules = await context.TenantModuleEntitlements
            .IgnoreQueryFilters()
            .Where(item => item.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);
        var existingSubmodules = await context.TenantSubmoduleEntitlements
            .IgnoreQueryFilters()
            .Where(item => item.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

        var desiredSubmoduleKeys = normalized
            .SelectMany(item => item.Value.Select(submodule => (item.Key, submodule)))
            .ToHashSet();
        context.TenantSubmoduleEntitlements.RemoveRange(existingSubmodules.Where(item =>
            !desiredSubmoduleKeys.Contains((item.ModuleCode, item.SubmoduleCode))));
        context.TenantModuleEntitlements.RemoveRange(existingModules.Where(item =>
            !normalized.ContainsKey(item.ModuleCode)));

        var existingModuleCodes = existingModules
            .Select(item => item.ModuleCode)
            .ToHashSet(StringComparer.Ordinal);
        var existingSubmoduleKeys = existingSubmodules
            .Select(item => (item.ModuleCode, item.SubmoduleCode))
            .ToHashSet();
        foreach (var item in normalized)
        {
            if (!existingModuleCodes.Contains(item.Key))
                context.TenantModuleEntitlements.Add(new TenantModuleEntitlement(tenantId, item.Key));

            foreach (var submodule in item.Value)
            {
                if (!existingSubmoduleKeys.Contains((item.Key, submodule)))
                    context.TenantSubmoduleEntitlements.Add(
                        new TenantSubmoduleEntitlement(tenantId, item.Key, submodule));
            }
        }
    }

    public Task<bool> HasAccessAsync(
        string tenantId,
        string moduleCode,
        string submoduleCode,
        CancellationToken cancellationToken = default) =>
        context.TenantSubmoduleEntitlements
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(item => item.TenantId == tenantId &&
                              item.ModuleCode == moduleCode.Trim().ToLowerInvariant() &&
                              item.SubmoduleCode == submoduleCode.Trim().ToLowerInvariant(), cancellationToken);

    public async Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var modules = await context.TenantModuleEntitlements
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(item => item.TenantId == tenantId)
            .OrderBy(item => item.ModuleCode)
            .ToArrayAsync(cancellationToken);
        var submodules = await context.TenantSubmoduleEntitlements
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(item => item.TenantId == tenantId)
            .ToArrayAsync(cancellationToken);

        return modules.Select(module => new TenantModuleEntitlementResponse(
            module.ModuleCode,
            submodules
                .Where(item => item.ModuleCode == module.ModuleCode)
                .Select(item => item.SubmoduleCode)
                .OrderBy(code => code)
                .ToArray())).ToArray();
    }

    public Task<bool> UserHasPermissionAsync(
        string userId,
        string tenantId,
        string permission,
        CancellationToken cancellationToken = default) =>
        (from userRole in context.UserRoles.AsNoTracking()
         join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
         join claim in context.RoleClaims.AsNoTracking() on role.Id equals claim.RoleId
         where userRole.UserId == userId &&
               claim.ClaimType == Permissions.Type &&
               claim.ClaimValue == permission &&
               (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId))
         select role.Id).AnyAsync(cancellationToken);

    public async Task<IReadOnlySet<string>> GetUserPermissionsAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var values = await (
            from userRole in context.UserRoles.AsNoTracking()
            join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
            join claim in context.RoleClaims.AsNoTracking() on role.Id equals claim.RoleId
            where userRole.UserId == userId &&
                  claim.ClaimType == Permissions.Type &&
                  (role.IsSystem || (!role.IsDeleted && role.TenantId == tenantId))
            select claim.ClaimValue)
            .Where(permission => permission != null)
            .Select(permission => permission!)
            .Distinct()
            .ToArrayAsync(cancellationToken);

        return values.ToHashSet(StringComparer.Ordinal);
    }

    public Task<bool> IsSuperAdminAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        (from userRole in context.UserRoles.AsNoTracking()
         join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
         where userRole.UserId == userId &&
               role.IsSystem &&
               role.NormalizedName == AppRoles.super_admin.ToUpper()
         select role.Id).AnyAsync(cancellationToken);
}
