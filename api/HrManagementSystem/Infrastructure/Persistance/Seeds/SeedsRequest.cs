namespace HrManagementSystem.Infrastructure.Persistance.Seeds;

public static class SeedsRequest
{
    public static async Task<WebApplication> AddSeedsRequest(this WebApplication webApplication)
    {
        var scopeFactory = webApplication.Services.GetRequiredService<IServiceScopeFactory>();
        using var scope = scopeFactory.CreateScope();

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await DefaultRoles.SeedRolesAsync(roleManager);
        await DefaultUsers.SeedAdminPermissionsAsync(roleManager);
        await DefaultUsers.SeedViewerUserAsync(userManager, configuration);
        await DefaultUsers.SeedAdminUserAsync(userManager, configuration);

        return webApplication;
    }
}
