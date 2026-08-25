using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Seeds;

public static class DefaultUsers
{
    public static Task SeedSuperAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration) =>
        SeedUserAsync(
            userManager,
            configuration.GetSection("BootstrapUsers:SuperAdmin"),
            AppRoles.super_admin);

    public static Task SeedViewerUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration) =>
        SeedUserAsync(userManager, configuration.GetSection("BootstrapUsers:Viewer"), AppRoles.user);

    public static Task SeedAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration) =>
        SeedUserAsync(userManager, configuration.GetSection("BootstrapUsers:Admin"), AppRoles.admin);

    public static async Task SeedAdminPermissionsAsync(RoleManager<ApplicationRole> roleManager)
    {
        var normalizedAdminName = roleManager.NormalizeKey(AppRoles.admin);
        var adminRole = await roleManager.Roles.SingleOrDefaultAsync(role =>
            role.IsSystem && role.NormalizedName == normalizedAdminName);
        if (adminRole is null)
            throw new InvalidOperationException("The administrator role was not created.");

        var existingClaims = await roleManager.GetClaimsAsync(adminRole);
        foreach (var claim in existingClaims.Where(claim =>
                     claim.Type == Permissions.Type &&
                     Permissions.GetPlatformGeographyPermissions().Contains(
                         claim.Value,
                         StringComparer.Ordinal)))
        {
            var removeResult = await roleManager.RemoveClaimAsync(adminRole, claim);
            if (!removeResult.Succeeded)
                throw new InvalidOperationException($"Unable to remove platform permission {claim.Value} from admin.");
        }

        var permissions = Permissions.GetTenantPermissions()
            .OfType<string>()
            .Distinct(StringComparer.Ordinal);

        foreach (var permission in permissions)
        {
            if (existingClaims.Any(claim =>
                    claim.Type == Permissions.Type && claim.Value == permission))
            {
                continue;
            }

            var result = await roleManager.AddClaimAsync(
                adminRole,
                new Claim(Permissions.Type, permission));

            if (!result.Succeeded)
                throw new InvalidOperationException($"Unable to seed permission {permission}.");
        }
    }

    public static async Task SeedSuperAdminGeographyPermissionsAsync(
        RoleManager<ApplicationRole> roleManager)
    {
        var normalizedRoleName = roleManager.NormalizeKey(AppRoles.super_admin);
        var role = await roleManager.Roles.SingleOrDefaultAsync(candidate =>
            candidate.IsSystem && candidate.NormalizedName == normalizedRoleName);
        if (role is null)
            throw new InvalidOperationException("The platform administrator role was not created.");

        var existingClaims = await roleManager.GetClaimsAsync(role);
        foreach (var permission in Permissions.GetPlatformGeographyPermissions())
        {
            if (existingClaims.Any(claim =>
                    claim.Type == Permissions.Type &&
                    claim.Value == permission))
            {
                continue;
            }

            var result = await roleManager.AddClaimAsync(
                role,
                new Claim(Permissions.Type, permission));
            if (!result.Succeeded)
                throw new InvalidOperationException($"Unable to seed platform permission {permission}.");
        }
    }

    private static async Task SeedUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfigurationSection section,
        string role)
    {
        var userName = section["UserName"];
        var email = section["Email"];
        var password = section["Password"];

        // Bootstrap accounts are opt-in and their passwords must come from a secret provider.
        if (string.IsNullOrWhiteSpace(userName) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        if (await userManager.FindByEmailAsync(email) is not null)
            return;

        var user = new ApplicationUser
        {
            TenantId = TenantDefaults.DefaultId,
            UserName = userName,
            Email = email,
            FirstName = section["FirstName"] ?? userName,
            LastName = section["LastName"] ?? string.Empty,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Unable to create bootstrap user {userName}: " +
                string.Join(", ", createResult.Errors.Select(error => error.Description)));
        }

        var roleResult = await userManager.AddToRoleAsync(user, role);
        if (!roleResult.Succeeded)
            throw new InvalidOperationException($"Unable to assign role {role} to {userName}.");
    }
}
