namespace HrManagementSystem.Infrastructure.Persistance.Seeds;

public static class DefaultRoles
{
    public static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        if (!await roleManager.RoleExistsAsync(AppRoles.admin))
        {
            await roleManager.CreateAsync(new ApplicationRole(AppRoles.admin));
        }

        if (!await roleManager.RoleExistsAsync(AppRoles.user))
        {
            await roleManager.CreateAsync(new ApplicationRole
            {
                Name = AppRoles.user,
                IsDefault = true
            });
        }
    }
}
