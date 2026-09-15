using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Entities;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;

public sealed class TenantRoleValidator(
    PlatformDbContext context,
    IdentityErrorDescriber errors) : IRoleValidator<PlatformApplicationRole>
{
    private static readonly HashSet<string> SystemNames =
    [
        PlatformRoleNames.SuperAdmin.ToUpperInvariant(),
        PlatformRoleNames.Admin.ToUpperInvariant(),
        PlatformRoleNames.User.ToUpperInvariant()
    ];

    public async Task<IdentityResult> ValidateAsync(
        RoleManager<PlatformApplicationRole> manager,
        PlatformApplicationRole role)
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
