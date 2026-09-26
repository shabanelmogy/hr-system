using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class SystemRoleSeedTests
{
    [Fact]
    public async Task SeedSystemRolesAndPermissionsAsync_InitializesEmptyDatabaseIdempotently()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ICurrentActor>(EmptyCurrentActor.Instance);
        services.AddDbContext<PlatformDbContext>(options =>
            options.UseInMemoryDatabase(Guid.NewGuid().ToString("N")));
        services.AddIdentity<PlatformApplicationUser, PlatformApplicationRole>()
            .AddEntityFrameworkStores<PlatformDbContext>();

        await using var serviceProvider = services.BuildServiceProvider();
        await using var scope = serviceProvider.CreateAsyncScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<PlatformApplicationRole>>();
        var moduleCatalog = new ModuleCatalog([new FutureBusinessModule()]);
        var startupTask = new PlatformSystemRoleStartupTask(roleManager, moduleCatalog);

        var customRole = new PlatformApplicationRole("finance-clerk");
        Assert.True((await roleManager.CreateAsync(customRole)).Succeeded);
        Assert.True((await roleManager.AddClaimAsync(
            customRole,
            new System.Security.Claims.Claim(PermissionClaimNames.Permission, "FutureInventory:View"))).Succeeded);
        Assert.True((await roleManager.AddClaimAsync(
            customRole,
            new System.Security.Claims.Claim(PermissionClaimNames.Permission, "LegacyResource:Manage"))).Succeeded);

        await startupTask.ExecuteAsync();
        var adminBeforeReconciliation = await roleManager.FindByNameAsync(PlatformRoleNames.Admin);
        Assert.NotNull(adminBeforeReconciliation);
        Assert.True((await roleManager.AddClaimAsync(
            adminBeforeReconciliation,
            new System.Security.Claims.Claim(PermissionClaimNames.Permission, "LegacyResource:Manage"))).Succeeded);
        await startupTask.ExecuteAsync();

        var roles = await roleManager.Roles.OrderBy(role => role.NormalizedName).ToListAsync();
        Assert.Equal(4, roles.Count);
        Assert.Equal(3, roles.Count(role => role.IsSystem));

        var adminRole = Assert.Single(roles, role => role.NormalizedName == "ADMIN");
        var adminClaims = await roleManager.GetClaimsAsync(adminRole);
        var expectedPermissions = moduleCatalog.TenantEntitlementDefinitions
            .SelectMany(definition => definition.Submodules)
            .Where(submodule => submodule.PermissionAccessMode != PermissionAccessMode.Global)
            .SelectMany(submodule => submodule.RequiredPermissions)
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        Assert.NotEmpty(expectedPermissions);
        Assert.Contains("FutureInventory:View", expectedPermissions);
        Assert.Equal(expectedPermissions.Length, adminClaims.Count(claim => claim.Type == PermissionClaimNames.Permission));
        Assert.All(expectedPermissions, permission =>
            Assert.Single(adminClaims, claim =>
                claim.Type == PermissionClaimNames.Permission && claim.Value == permission));
        Assert.DoesNotContain(adminClaims, claim => claim.Value == "LegacyResource:Manage");

        var superAdminRole = Assert.Single(roles, role => role.NormalizedName == "SUPER_ADMIN");
        var superAdminClaims = await roleManager.GetClaimsAsync(superAdminRole);
        Assert.Single(superAdminClaims, claim =>
            claim.Type == PermissionClaimNames.Permission && claim.Value == "FutureOperations:View");
        Assert.DoesNotContain(superAdminClaims, claim =>
            claim.Type == PermissionClaimNames.Permission && claim.Value == "FutureInventory:View");

        var userRole = Assert.Single(roles, role => role.NormalizedName == "USER");
        Assert.True(userRole.IsDefault);

        var persistedCustomRole = Assert.Single(roles, role => role.NormalizedName == "FINANCE-CLERK");
        Assert.False(persistedCustomRole.IsSystem);
        var customClaims = await roleManager.GetClaimsAsync(persistedCustomRole);
        Assert.Single(customClaims, claim =>
            claim.Type == PermissionClaimNames.Permission && claim.Value == "FutureInventory:View");
        Assert.DoesNotContain(customClaims, claim => claim.Value == "LegacyResource:Manage");
    }

    private sealed class EmptyCurrentActor : ICurrentActor
    {
        internal static readonly EmptyCurrentActor Instance = new();
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }

    private sealed class FutureBusinessModule : IModule
    {
        public string Name => "FutureBusiness";

        public ModuleDefinition Definition => new(
            "future-business",
            Name,
            [
                new SubmoduleDefinition(
                    "inventory",
                    "Inventory",
                    ["FutureInventory:View"],
                    "/apps/future-business/inventory"),
                new SubmoduleDefinition(
                    "operations",
                    "Operations",
                    ["FutureOperations:View"],
                    null,
                    PermissionAccessMode.Global)
            ]);

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
        }

        public Task MigrateAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<string>>([]);
    }
}

