using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR;
using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class SystemRoleSeedTests
{
    [Fact]
    public async Task SeedSystemRolesAndPermissionsAsync_InitializesEmptyDatabaseIdempotently()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ICurrentActor>(EmptyCurrentActor.Instance);
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(Guid.NewGuid().ToString("N")));
        services.AddIdentity<ApplicationUser, ApplicationRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        await using var serviceProvider = services.BuildServiceProvider();
        await using var scope = serviceProvider.CreateAsyncScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var moduleCatalog = new ModuleCatalog(
            ErpSystem.Api.Modules.ErpModuleRegistry.Create()
                .Concat<IModule>([new FutureBusinessModule()])
                .ToArray());
        var startupTask = new LegacySystemRolePermissionStartupTask(roleManager, moduleCatalog);

        await startupTask.ExecuteAsync();
        await startupTask.ExecuteAsync();

        var roles = await roleManager.Roles.OrderBy(role => role.NormalizedName).ToListAsync();
        Assert.Equal(3, roles.Count);
        Assert.All(roles, role => Assert.True(role.IsSystem));

        var adminRole = Assert.Single(roles, role => role.NormalizedName == "ADMIN");
        var adminClaims = await roleManager.GetClaimsAsync(adminRole);
        var expectedPermissions = moduleCatalog.TenantEntitlementDefinitions
            .SelectMany(definition => definition.Submodules)
            .SelectMany(submodule => submodule.RequiredPermissions)
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        Assert.NotEmpty(expectedPermissions);
        Assert.Contains("FutureInventory:View", expectedPermissions);
        Assert.Equal(expectedPermissions.Length, adminClaims.Count(claim => claim.Type == Permissions.Type));
        Assert.All(expectedPermissions, permission =>
            Assert.Single(adminClaims, claim =>
                claim.Type == Permissions.Type && claim.Value == permission));
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
            [new SubmoduleDefinition(
                "inventory",
                "Inventory",
                ["FutureInventory:View"],
                "/apps/future-business/inventory")]);

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
