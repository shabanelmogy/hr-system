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

        var tenantPermissions = moduleCatalog.Definitions
            .SelectMany(definition => definition.Submodules)
            .Where(submodule => submodule.PermissionAccessMode != PermissionAccessMode.Global)
            .SelectMany(submodule => submodule.RequiredPermissions)
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        var globalPermissions = moduleCatalog.Definitions
            .SelectMany(definition => definition.Submodules)
            .Where(submodule => submodule.PermissionAccessMode == PermissionAccessMode.Global)
            .SelectMany(submodule => submodule.RequiredPermissions)
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        await EnsureClaimsAsync(adminRole, tenantPermissions, cancellationToken);
        await EnsureClaimsAsync(superAdminRole, globalPermissions, cancellationToken);
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

    private async Task EnsureClaimsAsync(
        PlatformApplicationRole role,
        IEnumerable<string> permissions,
        CancellationToken cancellationToken)
    {
        var existing = await roleManager.GetClaimsAsync(role);
        var existingValues = existing
            .Where(claim => claim.Type == PermissionClaimNames.Permission)
            .Select(claim => claim.Value)
            .ToHashSet(StringComparer.Ordinal);

        foreach (var permission in permissions.Where(value => !string.IsNullOrWhiteSpace(value))
                     .Distinct(StringComparer.Ordinal))
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (existingValues.Contains(permission))
                continue;

            var result = await roleManager.AddClaimAsync(role, new Claim(PermissionClaimNames.Permission, permission));
            EnsureSuccess(result, $"Unable to seed permission {permission}.");
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
