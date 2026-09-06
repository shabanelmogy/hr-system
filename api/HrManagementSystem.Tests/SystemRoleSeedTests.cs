using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Persistence.Seeds;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HrManagementSystem.Tests;

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

        await SeedsRequest.SeedSystemRolesAndPermissionsAsync(roleManager);
        await SeedsRequest.SeedSystemRolesAndPermissionsAsync(roleManager);

        var roles = await roleManager.Roles.OrderBy(role => role.NormalizedName).ToListAsync();
        Assert.Equal(3, roles.Count);
        Assert.All(roles, role => Assert.True(role.IsSystem));

        var adminRole = Assert.Single(roles, role => role.NormalizedName == "ADMIN");
        var adminClaims = await roleManager.GetClaimsAsync(adminRole);
        var expectedPermissions = Permissions.GetTenantPermissions()
            .OfType<string>()
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        Assert.NotEmpty(expectedPermissions);
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
}
