namespace HrManagementSystem.Infrastructure.Persistance.Seeds;

public static class DefaultUsers
{
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
        var adminRole = await roleManager.FindByNameAsync(AppRoles.admin);
        if (adminRole is null)
            throw new InvalidOperationException("The administrator role was not created.");

        var existingClaims = await roleManager.GetClaimsAsync(adminRole);
        var permissions = Permissions.GetAllPermissions()
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
