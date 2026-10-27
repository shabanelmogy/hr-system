using System.Security.Claims;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Domain.Security.Users.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.BuildingBlocks.Context.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class UserCompanyPermissionMaterialTests
{
    [Theory]
    [InlineData("", 1, "user")]
    [InlineData("tenant", 0, "user")]
    [InlineData("tenant", 1, "")]
    public void GrantSet_ConstructorRejectsMissingScope(string tenantId, int companyId, string userId) =>
        Assert.ThrowsAny<ArgumentException>(() => new UserCompanyPermissionGrantSet(tenantId, companyId, userId));

    [Fact]
    public void GrantSet_ReplaceEnforcesRevisionKeysAndNoOp()
    {
        var set = new UserCompanyPermissionGrantSet("tenant", 1, "user");
        Assert.True(set.Replace(["Orders:View"], 0));
        Assert.False(set.Replace(["Orders:View"], 1));
        Assert.ThrowsAny<ArgumentException>(() => set.Replace(["Orders:View", "Orders:View"], 1));
        Assert.ThrowsAny<ArgumentException>(() => set.Replace(["NoColon"], 1));
        Assert.ThrowsAny<ArgumentException>(() => set.Replace([new string('x', 201) + ":View"], 1));
        Assert.ThrowsAny<InvalidOperationException>(() => set.Replace(["Orders:Edit"], 0));
    }

    [Fact]
    public async Task TokenMaterial_UsesRequestedCompanyForDirectPermissions()
    {
        var source = new CompanySource();
        var services = new ServiceCollection();
        services.AddSingleton<IAccessTokenClaimMaterialSource>(source);
        services.AddPlatformApplication();
        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<IAccessTokenClaimMaterialService>();
        var result = await service.BuildAsync(new AccessTokenClaimMaterialRequest(
            new AccessTokenUserSnapshot("user", "name", "email", "f", "l", "stamp"), "session", "jwt", 2, "tenant"));
        var permissions = result.Claims.Where(x => x.Type == PermissionClaimNames.Permission).Select(x => x.Value).ToArray();
        Assert.Contains("Orders:View", permissions);
        Assert.DoesNotContain("Payroll:View", permissions);
        Assert.Equal(2, source.CompanyId);
    }

    [Fact]
    public async Task ContractSource_UnionsRolesAndCurrentCompanyDirectGrants_WithoutCrossScopeLeakage()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        await using (var seed = new PlatformDbContext(options))
        {
            var role = new PlatformApplicationRole("Planner") { Id = "role", TenantId = "tenant-a" };
            seed.Roles.Add(role);
            seed.UserRoles.Add(new IdentityUserRole<string> { UserId = "user", RoleId = role.Id });
            seed.RoleClaims.Add(new IdentityRoleClaim<string> { RoleId = role.Id, ClaimType = PermissionClaimNames.Permission, ClaimValue = "Roles:View" });
            var a = new UserCompanyPermissionGrantSet("tenant-a", 1, "user"); a.Replace(["Orders:View"], 0);
            var b = new UserCompanyPermissionGrantSet("tenant-a", 2, "user"); b.Replace(["Payroll:View"], 0);
            var foreign = new UserCompanyPermissionGrantSet("tenant-b", 3, "user"); foreign.Replace(["Foreign:View"], 0);
            seed.UserCompanyPermissionGrantSets.AddRange(a, b, foreign);
            await seed.SaveChangesAsync();
        }
        await using var scoped = new PlatformDbContext(options, new Actor("tenant-a", 1, "actor"));
        var source = new PlatformContractSource(scoped);
        var permissions = await source.GetUserPermissionsAsync("user", "tenant-a");
        Assert.Contains("Roles:View", permissions);
        Assert.Contains("Orders:View", permissions);
        Assert.DoesNotContain("Payroll:View", permissions);
        Assert.DoesNotContain("Foreign:View", permissions);
        Assert.True(await source.UserHasPermissionAsync("user", "tenant-a", "Orders:View"));
        Assert.False(await source.UserHasPermissionAsync("user", "tenant-a", "Payroll:View"));
        Assert.False(await source.UserHasPermissionAsync("user", "tenant-b", "Foreign:View"));
    }

    [Fact]
    public async Task DbContext_RejectsCompanyScopedGrantOutsideTrustedScope()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
        await using var context = new PlatformDbContext(options, new Actor("tenant-a", 1, "actor"));
        context.UserCompanyPermissionGrantSets.Add(new UserCompanyPermissionGrantSet("tenant-a", 2, "user"));
        await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());
    }

    private sealed class CompanySource : IAccessTokenClaimMaterialSource, ICompanyPermissionClaimMaterialSource
    {
        public int CompanyId { get; private set; }
        public Task<AccessTokenClaimMaterialSourceSnapshot> GetAsync(string userId, string tenantId, CancellationToken cancellationToken = default) =>
            Task.FromResult(new AccessTokenClaimMaterialSourceSnapshot(new AccessTokenTenantSnapshot(tenantId, tenantId, null), [], []));
        public Task<IReadOnlySet<string>> GetDirectPermissionsAsync(string userId, string tenantId, int companyId, CancellationToken cancellationToken = default)
        {
            CompanyId = companyId;
            IReadOnlySet<string> permissions = companyId == 2
                ? new HashSet<string>(["Orders:View"], StringComparer.Ordinal)
                : new HashSet<string>(["Payroll:View"], StringComparer.Ordinal);
            return Task.FromResult(permissions);
        }
    }

    private sealed record Actor(string? TenantId, int? CompanyId, string? UserId) : ICurrentActor;
}
