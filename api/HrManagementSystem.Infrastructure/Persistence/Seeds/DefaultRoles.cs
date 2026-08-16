using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Seeds;

public static class DefaultRoles
{
    public static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        if (!await SystemRoleExistsAsync(roleManager, AppRoles.super_admin))
        {
            await roleManager.CreateAsync(new ApplicationRole(AppRoles.super_admin) { IsSystem = true });
        }

        if (!await SystemRoleExistsAsync(roleManager, AppRoles.admin))
        {
            await roleManager.CreateAsync(new ApplicationRole(AppRoles.admin) { IsSystem = true });
        }

        if (!await SystemRoleExistsAsync(roleManager, AppRoles.user))
        {
            await roleManager.CreateAsync(new ApplicationRole
            {
                Name = AppRoles.user,
                IsSystem = true,
                IsDefault = true
            });
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
