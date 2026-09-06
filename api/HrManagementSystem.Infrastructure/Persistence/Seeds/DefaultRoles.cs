using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Seeds;

public static class DefaultRoles
{
    public static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        await EnsureSystemRoleAsync(roleManager, AppRoles.super_admin);
        await EnsureSystemRoleAsync(roleManager, AppRoles.admin);
        await EnsureSystemRoleAsync(roleManager, AppRoles.user, isDefault: true);
    }

    private static async Task EnsureSystemRoleAsync(
        RoleManager<ApplicationRole> roleManager,
        string roleName,
        bool isDefault = false)
    {
        if (await SystemRoleExistsAsync(roleManager, roleName))
            return;

        var result = await roleManager.CreateAsync(new ApplicationRole(roleName)
        {
            IsSystem = true,
            IsDefault = isDefault
        });

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Unable to create system role {roleName}: " +
                string.Join(", ", result.Errors.Select(error => error.Description)));
        }
    }

    private static Task<bool> SystemRoleExistsAsync(
        RoleManager<ApplicationRole> roleManager,
        string roleName)
    {
        var normalizedName = roleManager.NormalizeKey(roleName);
        return roleManager.Roles.AnyAsync(role =>
            role.IsSystem && role.NormalizedName == normalizedName);
    }
}
