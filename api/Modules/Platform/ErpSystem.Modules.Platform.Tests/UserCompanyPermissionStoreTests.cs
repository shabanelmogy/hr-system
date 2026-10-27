using System.Security.Claims;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Features.Security.UserPermissions;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.UserPermissions;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class UserCompanyPermissionStoreTests
{
    [Fact]
    public async Task ReadShowsCatalogInheritedSourcesAndDirectChoices()
    {
        await using var fixture = await Fixture.CreateAsync();
        var result = await fixture.Store.GetAsync("target", "tenant", 1);
        Assert.NotNull(result);
        var inherited = Assert.Single(result.Permissions, item => item.Permission == "Orders:View");
        Assert.Equal(["Readers"], inherited.InheritedFrom);
        Assert.True(inherited.IsEffective);
        Assert.False(inherited.IsDirect);
        Assert.True(Assert.Single(result.Permissions, item => item.Permission == "Orders:Edit").CanGrant);
    }

    [Fact]
    public async Task ReplaceAndNoopAndStaleRevisionPreserveAtomicIntentAndRoleGrants()
    {
        await using var fixture = await Fixture.CreateAsync();
        var changed = await fixture.Store.ReplaceAsync("target", "tenant", 1, ["Orders:Edit"], 0);
        Assert.True(changed.IsSuccess);
        Assert.True(changed.Value.Changed);
        Assert.Equal(1, changed.Value.Revision);
        var stamp = (await fixture.Db.Users.SingleAsync(user => user.Id == "target")).SecurityStamp;
        Assert.NotEqual("original-stamp", stamp);
        Assert.Single(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
        Assert.All((await fixture.Db.Users.SingleAsync(user => user.Id == "target")).RefreshTokens,
            token => Assert.NotNull(token.RevokedOn));

        var noop = await fixture.Store.ReplaceAsync("target", "tenant", 1, ["Orders:Edit"], 1);
        Assert.True(noop.IsSuccess);
        Assert.False(noop.Value.Changed);
        Assert.Equal(stamp, (await fixture.Db.Users.SingleAsync(user => user.Id == "target")).SecurityStamp);
        Assert.Single(await fixture.Db.SecurityAuditEvents.ToArrayAsync());

        var stale = await fixture.Store.ReplaceAsync("target", "tenant", 1, [], 0);
        Assert.True(stale.IsFailure);
        Assert.Equal("UserPermissions.Conflict", stale.Error.Code);
        var inherited = await new PlatformContractSource(fixture.Db).UserHasPermissionAsync("target", "tenant", "Orders:View");
        Assert.True(inherited);
    }

    [Fact]
    public async Task DormantDirectGrantCanBeRemovedWithoutEntitlementOrActorAuthority()
    {
        await using var fixture = await Fixture.CreateAsync();
        Assert.True((await fixture.Store.ReplaceAsync("target", "tenant", 1, ["Orders:Edit"], 0)).IsSuccess);
        fixture.Db.TenantSubmoduleEntitlements.RemoveRange(fixture.Db.TenantSubmoduleEntitlements);
        fixture.Db.RoleClaims.RemoveRange(fixture.Db.RoleClaims.Where(claim => claim.RoleId == "admin-role"));
        await fixture.Db.SaveChangesAsync();
        var removed = await fixture.Store.ReplaceAsync("target", "tenant", 1, [], 1);
        Assert.True(removed.IsSuccess);
        Assert.Empty((await fixture.Db.UserCompanyPermissionGrantSets.Include(set => set.Grants).SingleAsync()).Grants);
        Assert.True(await new PlatformContractSource(fixture.Db).UserHasPermissionAsync("target", "tenant", "Orders:View"));
    }

    [Fact]
    public async Task RejectsAdministrativeUnknownAndUnownedGrantsWithoutChanges()
    {
        await using var fixture = await Fixture.CreateAsync();
        Assert.True((await fixture.Store.ReplaceAsync("target", "tenant", 1, ["UserPermissions:Edit"], 0)).IsFailure);
        fixture.Db.RoleClaims.RemoveRange(fixture.Db.RoleClaims.Where(claim => claim.RoleId == "admin-role"));
        await fixture.Db.SaveChangesAsync();
        var result = await fixture.Store.ReplaceAsync("target", "tenant", 1, ["Orders:Edit"], 0);
        Assert.True(result.IsFailure);
        Assert.Equal("UserPermissions.Forbidden", result.Error.Code);
        Assert.Empty(await fixture.Db.UserCompanyPermissionGrantSets.ToArrayAsync());
        Assert.Empty(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
        Assert.Equal("original-stamp", (await fixture.Db.Users.SingleAsync(user => user.Id == "target")).SecurityStamp);
    }

    [Fact]
    public async Task ForeignCompanyOrMissingMembershipDoesNotRevealOrMutateTarget()
    {
        await using var fixture = await Fixture.CreateAsync();
        Assert.Null(await fixture.Store.GetAsync("target", "tenant", 2));
        Assert.True((await fixture.Store.ReplaceAsync("target", "tenant", 2, ["Orders:Edit"], 0)).IsFailure);
        fixture.Db.UserTenantAccesses.RemoveRange(fixture.Db.UserTenantAccesses.Where(access => access.UserId == "target"));
        await fixture.Db.SaveChangesAsync();
        Assert.Null(await fixture.Store.GetAsync("target", "tenant", 1));
        Assert.True((await fixture.Store.ReplaceAsync("target", "tenant", 1, ["Orders:Edit"], 0)).IsFailure);
    }

    private sealed class Fixture(PlatformDbContext db, UserCompanyPermissionsStore store) : IAsyncDisposable
    {
        public PlatformDbContext Db { get; } = db;
        public UserCompanyPermissionsStore Store { get; } = store;
        public ValueTask DisposeAsync() => Db.DisposeAsync();

        public static async Task<Fixture> CreateAsync()
        {
            var actor = new Actor();
            var options = new DbContextOptionsBuilder<PlatformDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString("N")).Options;
            var db = new PlatformDbContext(options, actor);
            db.Companies.Add(new PlatformCompany("tenant", "ONE", "One", "واحد", "EGP", "Africa/Cairo", DateTime.UtcNow));
            db.Users.AddRange(new PlatformApplicationUser { Id = "actor", UserName = "admin", SecurityStamp = "actor-stamp" },
                new PlatformApplicationUser { Id = "target", UserName = "target", SecurityStamp = "original-stamp",
                    RefreshTokens = [PlatformRefreshToken.Create("hash", "session", "jwt", 1, DateTime.UtcNow.AddMinutes(-1), DateTime.UtcNow.AddDays(1), null, null)] });
            foreach (var userId in new[] { "actor", "target" })
            {
                db.UserTenantAccesses.Add(new PlatformUserTenantAccess { TenantId = "tenant", UserId = userId });
                db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess { TenantId = "tenant", CompanyId = 1, UserId = userId });
            }
            db.Roles.AddRange(new PlatformApplicationRole { Id = "admin-role", Name = "Administrator", IsSystem = true },
                new PlatformApplicationRole { Id = "reader-role", Name = "Readers", TenantId = "tenant" });
            db.UserRoles.AddRange(new IdentityUserRole<string> { UserId = "actor", RoleId = "admin-role" },
                new IdentityUserRole<string> { UserId = "target", RoleId = "reader-role" });
            db.RoleClaims.AddRange(new IdentityRoleClaim<string> { RoleId = "admin-role", ClaimType = "Permissions", ClaimValue = "Orders:Edit" },
                new IdentityRoleClaim<string> { RoleId = "admin-role", ClaimType = "Permissions", ClaimValue = "Orders:View" },
                new IdentityRoleClaim<string> { RoleId = "reader-role", ClaimType = "Permissions", ClaimValue = "Orders:View" });
            db.TenantSubmoduleEntitlements.Add(new PlatformTenantSubmoduleEntitlement { TenantId = "tenant", ModuleCode = "sales", SubmoduleCode = "orders" });
            await db.SaveChangesAsync();
            var store = new UserCompanyPermissionsStore(db, actor, new AuthCompanyAccessService(db, actor),
                new Catalog(), new RoleLockResourceFactory(), TimeProvider.System, new UserPermissionErrors(new KeyLocalizer()));
            return new(db, store);
        }
    }

    private sealed class Actor : ICurrentActor
    {
        public string? UserId => "actor";
        public string? TenantId => "tenant";
        public int? CompanyId => 1;
    }

    private sealed class KeyLocalizer : IStringLocalizer<UserPermissionErrors>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class Catalog : IModuleCatalogPolicy
    {
        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [];
        public IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog() => [];
        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() => [];
        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(string userId, string tenantId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([]);
        public IReadOnlySet<string> GetKnownPermissions() => GetTenantAssignablePermissions();
        public IReadOnlySet<string> GetTenantAssignablePermissions() => new HashSet<string>(["Orders:View", "Orders:Edit", "UserPermissions:Edit"]);
        public bool TryResolvePermission(string permission, out ModulePermissionCatalogItem resolvedPermission)
        {
            var business = permission is "Orders:View" or "Orders:Edit";
            resolvedPermission = new(permission, business ? "sales" : "platform", business ? "orders" : "users", true, business);
            return business || permission == "UserPermissions:Edit";
        }
        public Task<bool> IsSuperAdminAsync(string userId, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public bool IsValidEntitlement(IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements, out string? invalidCode) { invalidCode = null; return true; }
    }
}
