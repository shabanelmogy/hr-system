using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Persistence;

public sealed class RoleManagementReadStore(RoleManager<PlatformApplicationRole> roleManager)
    : IRoleManagementReadStore
{
    public async Task<IReadOnlyList<RoleResponse>> GetAllAsync(
        string tenantId,
        CancellationToken cancellationToken = default) =>
        await roleManager.Roles
            .AsNoTracking()
            .Where(role =>
                (role.IsSystem && role.NormalizedName != PlatformRoleNames.SuperAdmin.ToUpper()) ||
                (!role.IsSystem && role.TenantId == tenantId))
            .Select(role => new RoleResponse(
                role.Id,
                role.Name ?? string.Empty,
                role.IsDeleted,
                null,
                role.IsSystem))
            .ToListAsync(cancellationToken);

    public async Task<RoleDetailResponse?> GetByIdAsync(
        string tenantId,
        string id,
        CancellationToken cancellationToken = default)
    {
        var role = await FindVisibleRoleAsync(tenantId, id, cancellationToken);
        if (role is null)
            return null;

        var permissions = await roleManager.GetClaimsAsync(role);
        return new RoleDetailResponse(
            role.Id,
            role.Name ?? string.Empty,
            role.IsDeleted,
            permissions.Select(claim => claim.Value),
            role.IsSystem);
    }

    public async Task<RoleClaimsSnapshot?> GetClaimsAsync(
        string tenantId,
        string roleId,
        CancellationToken cancellationToken = default)
    {
        var role = await FindVisibleRoleAsync(tenantId, roleId, cancellationToken);
        if (role is null)
            return null;

        var permissions = (await roleManager.GetClaimsAsync(role))
            .Select(claim => claim.Value)
            .ToArray();
        return new RoleClaimsSnapshot(
            role.Id,
            role.Name ?? string.Empty,
            role.IsDeleted,
            role.IsSystem,
            permissions);
    }

    private Task<PlatformApplicationRole?> FindVisibleRoleAsync(
        string tenantId,
        string roleId,
        CancellationToken cancellationToken) =>
        roleManager.Roles.SingleOrDefaultAsync(role =>
            role.Id == roleId &&
            ((role.IsSystem && role.NormalizedName != PlatformRoleNames.SuperAdmin.ToUpper()) ||
             (!role.IsSystem && role.TenantId == tenantId)),
            cancellationToken);
}
