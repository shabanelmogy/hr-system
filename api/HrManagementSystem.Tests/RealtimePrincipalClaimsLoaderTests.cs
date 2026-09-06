using System.Security.Claims;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Security.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class RealtimePrincipalClaimsLoaderTests
{
    [Fact]
    public async Task LoadAsync_ReplacesTokenAuthorizationClaimsWithCurrentTenantDatabaseClaims()
    {
        await using var database = CreateContext();
        var systemRole = Role("system-admin", AppRoles.admin, isSystem: true);
        var tenantRole = Role("tenant-role", "HR Planner", isSystem: false, tenantId: "tenant-a");
        var otherTenantRole = Role("other-role", "Other Tenant", isSystem: false, tenantId: "tenant-b");
        database.Roles.AddRange(systemRole, tenantRole, otherTenantRole);
        database.UserRoles.AddRange(
            UserRole("user-id", systemRole.Id),
            UserRole("user-id", tenantRole.Id),
            UserRole("user-id", otherTenantRole.Id));
        database.RoleClaims.AddRange(
            Permission(systemRole.Id, Permissions.ViewCountries),
            Permission(tenantRole.Id, Permissions.ViewCountries),
            Permission(tenantRole.Id, Permissions.ViewStates),
            Permission(tenantRole.Id, "UnknownFeature:Manage"),
            Permission(otherTenantRole.Id, Permissions.ViewUsers));
        await database.SaveChangesAsync();

        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(ClaimTypes.Role, "Stale Role"),
            new Claim(JwtClaimNames.TenantRoleId, "stale-role-id"),
            new Claim(Permissions.Type, Permissions.ViewUsers)
        ], "Realtime");
        var principal = new ClaimsPrincipal(identity);
        var loader = new RealtimePrincipalClaimsLoader(database);

        await loader.LoadAsync(principal, "user-id", "tenant-a", CancellationToken.None);
        await loader.LoadAsync(principal, "user-id", "tenant-a", CancellationToken.None);

        Assert.Equal(
            new HashSet<string>([AppRoles.admin, "HR Planner"], StringComparer.Ordinal),
            principal.FindAll(ClaimTypes.Role).Select(claim => claim.Value).ToHashSet(StringComparer.Ordinal));
        Assert.Equal(
            new HashSet<string>([Permissions.ViewCountries, Permissions.ViewStates], StringComparer.Ordinal),
            principal.FindAll(Permissions.Type).Select(claim => claim.Value).ToHashSet(StringComparer.Ordinal));
        Assert.Equal(
            [tenantRole.Id],
            principal.FindAll(JwtClaimNames.TenantRoleId).Select(claim => claim.Value));
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, EmptyCurrentActor.Instance, TimeProvider.System);
    }

    private static ApplicationRole Role(
        string id,
        string name,
        bool isSystem,
        string? tenantId = null) => new(name)
        {
            Id = id,
            NormalizedName = name.ToUpperInvariant(),
            IsSystem = isSystem,
            TenantId = tenantId
        };

    private static IdentityUserRole<string> UserRole(string userId, string roleId) => new()
    {
        UserId = userId,
        RoleId = roleId
    };

    private static IdentityRoleClaim<string> Permission(string roleId, string value) => new()
    {
        RoleId = roleId,
        ClaimType = Permissions.Type,
        ClaimValue = value
    };

    private sealed class EmptyCurrentActor : ICurrentActor
    {
        internal static readonly EmptyCurrentActor Instance = new();
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
