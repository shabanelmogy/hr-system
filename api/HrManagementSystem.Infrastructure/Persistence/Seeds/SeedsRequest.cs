using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Seeds;

public static class SeedsRequest
{
    public static async Task<WebApplication> AddSeedsRequest(this WebApplication webApplication)
    {
        var scopeFactory = webApplication.Services.GetRequiredService<IServiceScopeFactory>();
        using var scope = scopeFactory.CreateScope();

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var timeProvider = scope.ServiceProvider.GetRequiredService<TimeProvider>();

        await DefaultTenants.SeedAsync(context, timeProvider);
        await DefaultRoles.SeedRolesAsync(roleManager);
        await DefaultUsers.SeedAdminPermissionsAsync(roleManager);
        await DefaultUsers.SeedViewerUserAsync(userManager, configuration);
        await DefaultUsers.SeedAdminUserAsync(userManager, configuration);
        await DefaultCompanies.SeedAsync(context);

        return webApplication;
    }
}
