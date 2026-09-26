using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Contracts.Authorization;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization;

public sealed class PlatformSystemRoleStartupTask(
    RoleManager<PlatformApplicationRole> roleManager,
    ModuleCatalog moduleCatalog) : IHostRuntimeStartupTask
{
    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        await EnsureSystemRoleAsync(PlatformRoleNames.SuperAdmin, cancellationToken: cancellationToken);
        await EnsureSystemRoleAsync(PlatformRoleNames.Admin, cancellationToken: cancellationToken);
        await EnsureSystemRoleAsync(PlatformRoleNames.User, isDefault: true, cancellationToken: cancellationToken);

        var adminRole = await FindSystemRoleAsync(PlatformRoleNames.Admin, cancellationToken)
            ?? throw new InvalidOperationException("The administrator role was not created.");
        var superAdminRole = await FindSystemRoleAsync(PlatformRoleNames.SuperAdmin, cancellationToken)
            ?? throw new InvalidOperationException("The platform administrator role was not created.");
        var userRole = await FindSystemRoleAsync(PlatformRoleNames.User, cancellationToken)
            ?? throw new InvalidOperationException("The default user role was not created.");

        var catalogSubmodules = moduleCatalog.Definitions
            .SelectMany(definition => definition.Submodules)
            .ToArray();
        var tenantPermissions = PlatformPermissions.TenantAdministration
            .Concat(catalogSubmodules
                .Where(submodule => submodule.PermissionAccessMode != PermissionAccessMode.Global)
                .SelectMany(submodule => submodule.RequiredPermissions))
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        var globalPermissions = PlatformPermissions.GlobalOperations
            .Concat(catalogSubmodules
                .Where(submodule => submodule.PermissionAccessMode == PermissionAccessMode.Global)
                .SelectMany(submodule => submodule.RequiredPermissions))
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        await SynchronizeClaimsAsync(adminRole, tenantPermissions, cancellationToken);
        await SynchronizeClaimsAsync(superAdminRole, globalPermissions, cancellationToken);
        await SynchronizeClaimsAsync(userRole, [], cancellationToken);
        await RemoveUnknownCustomRoleClaimsAsync(
            tenantPermissions.Concat(globalPermissions).ToHashSet(StringComparer.Ordinal),
            cancellationToken);
    }

    private async Task EnsureSystemRoleAsync(
        string roleName,
        bool isDefault = false,
        CancellationToken cancellationToken = default)
    {
        if (await FindSystemRoleAsync(roleName, cancellationToken) is not null)
            return;

        var result = await roleManager.CreateAsync(new PlatformApplicationRole(roleName)
        {
            IsSystem = true,
            IsDefault = isDefault
        });
        EnsureSuccess(result, $"Unable to create system role {roleName}.");
    }

    private async Task<PlatformApplicationRole?> FindSystemRoleAsync(
        string roleName,
        CancellationToken cancellationToken) =>
        await roleManager.Roles.SingleOrDefaultAsync(
            role => role.IsSystem &&
                    role.NormalizedName == roleManager.NormalizeKey(roleName),
            cancellationToken);

    private async Task SynchronizeClaimsAsync(
        PlatformApplicationRole role,
        IEnumerable<string> permissions,
        CancellationToken cancellationToken)
    {
        var targetValues = permissions
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.Ordinal)
            .ToHashSet(StringComparer.Ordinal);
        var existing = await roleManager.GetClaimsAsync(role);
        var permissionClaims = existing
            .Where(claim => claim.Type == PermissionClaimNames.Permission)
            .ToArray();
        var existingValues = permissionClaims.Select(claim => claim.Value).ToHashSet(StringComparer.Ordinal);

        foreach (var staleClaim in permissionClaims.Where(claim => !targetValues.Contains(claim.Value)))
        {
            cancellationToken.ThrowIfCancellationRequested();
            var result = await roleManager.RemoveClaimAsync(role, staleClaim);
            EnsureSuccess(result, $"Unable to remove stale permission {staleClaim.Value} from {role.Name}.");
        }

        foreach (var permission in targetValues)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (existingValues.Contains(permission))
                continue;

            var result = await roleManager.AddClaimAsync(role, new Claim(PermissionClaimNames.Permission, permission));
            EnsureSuccess(result, $"Unable to seed permission {permission}.");
        }
    }

    private async Task RemoveUnknownCustomRoleClaimsAsync(
        IReadOnlySet<string> allowedPermissions,
        CancellationToken cancellationToken)
    {
        var customRoles = await roleManager.Roles
            .Where(role => !role.IsSystem)
            .ToListAsync(cancellationToken);

        foreach (var role in customRoles)
        {
            var claims = await roleManager.GetClaimsAsync(role);
            foreach (var claim in claims.Where(claim =>
                         claim.Type == PermissionClaimNames.Permission &&
                         !allowedPermissions.Contains(claim.Value)))
            {
                cancellationToken.ThrowIfCancellationRequested();
                var result = await roleManager.RemoveClaimAsync(role, claim);
                EnsureSuccess(
                    result,
                    $"Unable to remove unknown permission {claim.Value} from custom role {role.Name}.");
            }
        }
    }

    private static void EnsureSuccess(IdentityResult result, string message)
    {
        if (result.Succeeded)
            return;
        throw new InvalidOperationException(
            $"{message} {string.Join(", ", result.Errors.Select(error => error.Description))}");
    }
}
