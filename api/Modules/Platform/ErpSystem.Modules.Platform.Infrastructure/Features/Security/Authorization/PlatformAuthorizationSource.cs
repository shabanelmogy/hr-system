using ErpSystem.Modules.Platform.Contracts.Authorization;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization;

internal sealed class PlatformAuthorizationSource(PlatformDbContext context) : IPlatformAuthorizationSource
{
    public async Task<PlatformRoleScopePage> GetRoleScopesPageAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = from role in context.Roles.AsNoTracking()
                    join tenant in context.Tenants.AsNoTracking() on role.TenantId equals tenant.Id into tenants
                    from tenant in tenants.DefaultIfEmpty()
                    where !role.IsDeleted
                    select new { role.Id, Name = role.Name!, role.TenantId, TenantName = tenant == null ? null : tenant.Name };
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(role => role.Name.Contains(term) || role.TenantName != null && role.TenantName.Contains(term));
        }
        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(role => role.TenantName).ThenBy(role => role.Name).ThenBy(role => role.Id)
            .Skip((Math.Clamp(page, 1, 100000) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .Select(role => new PlatformRoleScopeOption(role.Id, role.Name, role.TenantId, role.TenantName))
            .ToArrayAsync(cancellationToken);
        return new PlatformRoleScopePage(items, total);
    }

    public async Task<IReadOnlyList<PlatformRoleScopeOption>> GetRoleScopesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default) =>
        await (from role in context.Roles.AsNoTracking()
               join tenant in context.Tenants.AsNoTracking() on role.TenantId equals tenant.Id into tenants
               from tenant in tenants.DefaultIfEmpty()
               where !role.IsDeleted && roleIds.Contains(role.Id)
               select new PlatformRoleScopeOption(role.Id, role.Name!, role.TenantId, tenant == null ? null : tenant.Name))
            .ToArrayAsync(cancellationToken);
    public Task<int> GetUserCountAsync(CancellationToken cancellationToken = default) =>
        context.Users.AsNoTracking().CountAsync(cancellationToken);

    public async Task<IReadOnlyCollection<string>> GetUserRoleIdsAsync(string userId, CancellationToken cancellationToken = default) =>
        await context.UserRoles.AsNoTracking().Where(item => item.UserId == userId).Select(item => item.RoleId).ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyCollection<PlatformRoleOption>> GetRolesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default) =>
        await context.Roles.AsNoTracking().Where(role => roleIds.Contains(role.Id)).Select(role => new PlatformRoleOption(role.Id, role.Name!)).ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyCollection<PlatformRoleOption>> GetAssignableRolesAsync(
        string? tenantId,
        CancellationToken cancellationToken = default)
    {
        var normalizedAdminRoleName = PlatformRoleNames.Admin.ToUpperInvariant();
        return await context.Roles.AsNoTracking()
            .Where(role => !role.IsDeleted &&
                (role.TenantId == tenantId || role.IsSystem && role.NormalizedName == normalizedAdminRoleName))
            .OrderBy(role => role.Name)
            .Select(role => new PlatformRoleOption(role.Id, role.Name!))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<bool> AreRoleIdsValidAsync(string? tenantId, IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default)
    {
        if (roleIds.Count == 0)
            return true;
        var distinct = roleIds.Distinct(StringComparer.Ordinal).ToArray();
        var normalizedAdminRoleName = PlatformRoleNames.Admin.ToUpperInvariant();
        var count = await context.Roles.AsNoTracking().CountAsync(role =>
            distinct.Contains(role.Id) && !role.IsDeleted &&
            (role.TenantId == tenantId || role.IsSystem && role.NormalizedName == normalizedAdminRoleName), cancellationToken);
        return count == distinct.Length;
    }
}
