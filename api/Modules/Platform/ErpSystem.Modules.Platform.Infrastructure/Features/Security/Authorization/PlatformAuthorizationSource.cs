using ErpSystem.Modules.Platform.Contracts.Authorization;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization;

internal sealed class PlatformAuthorizationSource(PlatformDbContext context) : IPlatformAuthorizationSource
{
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
