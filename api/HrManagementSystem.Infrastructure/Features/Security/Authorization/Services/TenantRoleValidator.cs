using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;

public sealed class TenantRoleValidator(
    ApplicationDbContext context,
    IdentityErrorDescriber errors) : IRoleValidator<ApplicationRole>
{
    private static readonly HashSet<string> SystemNames =
    [
        AppRoles.super_admin.ToUpperInvariant(),
        AppRoles.admin.ToUpperInvariant(),
        AppRoles.user.ToUpperInvariant()
    ];

    public async Task<IdentityResult> ValidateAsync(
        RoleManager<ApplicationRole> manager,
        ApplicationRole role)
    {
        ArgumentNullException.ThrowIfNull(manager);
        ArgumentNullException.ThrowIfNull(role);

        var roleName = await manager.GetRoleNameAsync(role);
        if (string.IsNullOrWhiteSpace(roleName))
            return IdentityResult.Failed(errors.InvalidRoleName(roleName));

        var normalizedName = manager.NormalizeKey(roleName);
        var isReservedSystemName = SystemNames.Contains(normalizedName);
        if (role.IsSystem)
        {
            if (!string.IsNullOrWhiteSpace(role.TenantId) || !isReservedSystemName)
                return IdentityResult.Failed(errors.InvalidRoleName(roleName));
        }
        else if (string.IsNullOrWhiteSpace(role.TenantId) || isReservedSystemName)
        {
            return IdentityResult.Failed(errors.InvalidRoleName(roleName));
        }

        var duplicateExists = await context.Roles
            .AsNoTracking()
            .AnyAsync(candidate =>
                candidate.Id != role.Id &&
                candidate.NormalizedName == normalizedName &&
                (role.IsSystem
                    ? candidate.IsSystem
                    : !candidate.IsSystem && candidate.TenantId == role.TenantId));

        return duplicateExists
            ? IdentityResult.Failed(errors.DuplicateRoleName(roleName))
            : IdentityResult.Success;
    }
}
