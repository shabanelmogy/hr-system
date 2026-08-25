using System.Reflection;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Security.Authorization.Contracts;
using HrManagementSystem.Application.Features.Security.Authorization.Errors;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;
using HrManagementSystem.Infrastructure.Migrations;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Security.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

public sealed class TenantRoleIsolationTests
{
    [Fact]
    public async Task RoleValidator_AllowsSameCustomNameAcrossTenants_ButRejectsSameTenantAndSystemNames()
    {
        await using var context = CreateContext("tenant-a");
        using var roleManager = CreateRoleManager(context);

        var first = await roleManager.CreateAsync(CustomRole("tenant-a", "HR Manager"));
        var secondTenant = await roleManager.CreateAsync(CustomRole("tenant-b", "HR Manager"));
        var duplicate = await roleManager.CreateAsync(CustomRole("tenant-a", "HR Manager"));
        var reserved = await roleManager.CreateAsync(CustomRole("tenant-a", AppRoles.admin));
        var system = await roleManager.CreateAsync(new ApplicationRole(AppRoles.admin) { IsSystem = true });
        var duplicateSystem = await roleManager.CreateAsync(new ApplicationRole(AppRoles.admin) { IsSystem = true });

        Assert.True(first.Succeeded);
        Assert.True(secondTenant.Succeeded);
        Assert.False(duplicate.Succeeded);
        Assert.False(reserved.Succeeded);
        Assert.True(system.Succeeded);
        Assert.False(duplicateSystem.Succeeded);
    }

    [Fact]
    public async Task AssignmentResolution_UsesTenantRoleId_AndUpdatePreservesOtherTenantAndSuperAdminAssignments()
    {
        await using var context = CreateContext("tenant-a");
        var user = CreateUser("managed-user", "tenant-a");
        var tenantARole = CustomRole("tenant-a", "Approver", "role-a");
        var tenantBRole = CustomRole("tenant-b", "Approver", "role-b");
        var replacement = CustomRole("tenant-a", "Payroll", "role-payroll");
        var admin = SystemRole(AppRoles.admin, "role-admin");
        var superAdmin = SystemRole(AppRoles.super_admin, "role-super");
        context.AddRange(user, tenantARole, tenantBRole, replacement, admin, superAdmin);
        context.UserRoles.AddRange(
            Assignment(user.Id, tenantARole.Id),
            Assignment(user.Id, tenantBRole.Id),
            Assignment(user.Id, admin.Id),
            Assignment(user.Id, superAdmin.Id));
        await context.SaveChangesAsync();
        var assignments = new TenantRoleAssignmentService(context);

        var resolved = await assignments.ResolveAssignableRolesAsync("tenant-a", ["Approver"]);
        Assert.NotNull(resolved);
        Assert.Equal(tenantARole.Id, Assert.Single(resolved).Id);

        await assignments.SynchronizeAssignmentsAsync(user.Id, "tenant-a", [replacement]);
        await context.SaveChangesAsync();

        var assignedRoleIds = await context.UserRoles
            .Where(item => item.UserId == user.Id)
            .Select(item => item.RoleId)
            .ToHashSetAsync();
        Assert.Equal(
            new HashSet<string>([tenantBRole.Id, replacement.Id, admin.Id, superAdmin.Id]),
            assignedRoleIds);
    }

    [Fact]
    public async Task RoleService_HidesCrossTenantAndSuperAdminRoles_AndSystemRolesAreImmutable()
    {
        await using var context = CreateContext("tenant-a");
        var ownRole = CustomRole("tenant-a", "Own role", "role-own");
        var foreignRole = CustomRole("tenant-b", "Foreign role", "role-foreign");
        var admin = SystemRole(AppRoles.admin, "role-admin");
        var superAdmin = SystemRole(AppRoles.super_admin, "role-super");
        context.AddRange(ownRole, foreignRole, admin, superAdmin);
        await context.SaveChangesAsync();
        using var roleManager = CreateRoleManager(context);
        var service = new RoleService(
            roleManager,
            new RoleErrors(new EchoLocalizer<RoleRequest>()),
            new NullRealtimeDispatcher(),
            new TestCurrentActor(null, "tenant-a"));

        var visible = await service.GetAllAsync();
        Assert.Contains(visible, role => role.Id == ownRole.Id && !role.IsSystem);
        Assert.Contains(visible, role => role.Id == admin.Id && role.IsSystem);
        Assert.DoesNotContain(visible, role => role.Id == foreignRole.Id || role.Id == superAdmin.Id);

        Assert.True((await service.ToggleStatusAsync(admin.Id, default)).IsFailure);
        Assert.True((await service.ToggleStatusAsync(foreignRole.Id, default)).IsFailure);
        Assert.True((await service.UpdateAsync(
            new RoleRequest(ownRole.Id, AppRoles.user, null), default)).IsFailure);
    }

    [Fact]
    public async Task RoleService_PublishesClaimChangesToTenantPermissionAndTenantRoleIdAudiences()
    {
        await using var context = CreateContext("tenant-a");
        var ownRole = CustomRole("tenant-a", "Approver", "role-own");
        context.Add(ownRole);
        await context.SaveChangesAsync();
        using var roleManager = CreateRoleManager(context);
        var dispatcher = new RecordingRealtimeDispatcher();
        var service = new RoleService(
            roleManager,
            new RoleErrors(new EchoLocalizer<RoleRequest>()),
            dispatcher,
            new TestCurrentActor("actor", "tenant-a"));

        var result = await service.UpdateRoleClaims(
            new RoleRequest(
                ownRole.Id,
                ownRole.Name!,
                [new CheckBoxViewModel
                {
                    DisplayValue = Permissions.ViewRoles,
                    IsSelected = true
                }]),
            default);

        Assert.True(result.IsSuccess);
        Assert.Collection(
            dispatcher.Requests,
            change =>
            {
                Assert.Equal("roles", change.Resource);
                Assert.Equal(RealtimeAudienceKind.TenantPermission, change.Audience.Kind);
                Assert.Equal("tenant-a", change.Audience.TenantId);
                Assert.Equal(Permissions.ViewRoles, change.Audience.Permission);
            },
            change =>
            {
                Assert.Equal("role-claims", change.Resource);
                Assert.Equal(RealtimeAudienceKind.TenantPermission, change.Audience.Kind);
                Assert.Equal("tenant-a", change.Audience.TenantId);
                Assert.Equal(Permissions.ViewRoles, change.Audience.Permission);
            },
            change =>
            {
                Assert.Equal("role-claims", change.Resource);
                Assert.Equal(RealtimeAudienceKind.TenantRole, change.Audience.Kind);
                Assert.Equal("tenant-a", change.Audience.TenantId);
                Assert.Equal(ownRole.Id, change.Audience.RoleId);
            });
        Assert.Equal(dispatcher.Requests[1].EventId, dispatcher.Requests[2].EventId);
    }

    [Fact]
    public async Task RoleService_RejectsPlatformGeographyClaimsWithoutRemovingExistingClaims()
    {
        await using var context = CreateContext("tenant-a");
        var ownRole = CustomRole("tenant-a", "Approver", "role-own");
        context.Add(ownRole);
        context.RoleClaims.Add(RoleClaim(ownRole.Id, Permissions.ViewRoles));
        await context.SaveChangesAsync();
        using var roleManager = CreateRoleManager(context);
        var service = new RoleService(
            roleManager,
            new RoleErrors(new EchoLocalizer<RoleRequest>()),
            new NullRealtimeDispatcher(),
            new TestCurrentActor("actor", "tenant-a"));

        var result = await service.UpdateRoleClaims(
            new RoleRequest(
                ownRole.Id,
                ownRole.Name!,
                [new CheckBoxViewModel
                {
                    DisplayValue = Permissions.ViewCountries,
                    IsSelected = true
                }]),
            default);

        Assert.True(result.IsFailure);
        Assert.Equal("Role.InvalidPermissions", result.Error.Code);
        Assert.Contains(
            await roleManager.GetClaimsAsync(ownRole),
            claim => claim.Type == Permissions.Type && claim.Value == Permissions.ViewRoles);
    }

    [Fact]
    public async Task Jwt_IncludesSystemAndSelectedTenantRolesOnly_AndExcludesDeletedCustomRoleClaims()
    {
        await using var context = CreateContext("tenant-a");
        var tenant = new Tenant("tenant-a", "tenant-a", "Tenant A", DateTime.UtcNow);
        var user = CreateUser("jwt-user", "tenant-a");
        var admin = SystemRole(AppRoles.admin, "role-admin");
        var selected = CustomRole("tenant-a", "Approver", "role-selected");
        var foreign = CustomRole("tenant-b", "Approver", "role-foreign");
        var deleted = CustomRole("tenant-a", "Deleted", "role-deleted");
        deleted.IsDeleted = true;
        context.AddRange(tenant, user, admin, selected, foreign, deleted);
        context.UserRoles.AddRange(
            Assignment(user.Id, admin.Id),
            Assignment(user.Id, selected.Id),
            Assignment(user.Id, foreign.Id),
            Assignment(user.Id, deleted.Id));
        context.RoleClaims.AddRange(
            RoleClaim(admin.Id, Permissions.ViewRoles),
            RoleClaim(selected.Id, Permissions.ViewStates),
            RoleClaim(foreign.Id, Permissions.ViewCountries),
            RoleClaim(deleted.Id, Permissions.ViewDistricts));
        await context.SaveChangesAsync();

        var provider = new JwtProvider(Options.Create(new JwtOptions
        {
            Key = "test-only-signing-key-with-more-than-thirty-two-characters",
            Issuer = "HrManagementSystem",
            Audience = "HrManagementSystem.Web",
            ExpireInMinutes = 10
        }), context);
        var issued = await provider.GenerateAccessTokenAsync(user, "session", 1, "tenant-a");
        var jwt = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(issued.Token);
        var roles = jwt.Claims.Where(claim => claim.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(claim => claim.Value).ToHashSet(StringComparer.Ordinal);
        var permissions = jwt.Claims.Where(claim => claim.Type == Permissions.Type)
            .Select(claim => claim.Value).ToHashSet(StringComparer.Ordinal);

        Assert.Equal(new HashSet<string>([AppRoles.admin, "Approver"]), roles);
        Assert.Contains(Permissions.ViewRoles, permissions);
        Assert.Contains(Permissions.ViewStates, permissions);
        Assert.DoesNotContain(Permissions.ViewCountries, permissions);
        Assert.DoesNotContain(Permissions.ViewDistricts, permissions);
        Assert.Contains(jwt.Claims, claim =>
            claim.Type == JwtClaimNames.TenantRoleId && claim.Value == selected.Id);
        Assert.DoesNotContain(jwt.Claims, claim =>
            claim.Type == JwtClaimNames.TenantRoleId && claim.Value == foreign.Id);
    }

    [Fact]
    public void MigrationBackfill_DeduplicatesSharedRoleTenantBeforeAssigningCloneIds()
    {
        var migration = new TenantScopedRoleIsolation();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(TenantScopedRoleIsolation)
            .GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);
        var sql = Assert.Single(builder.Operations.OfType<SqlOperation>()).Sql;

        var distinctCte = sql.IndexOf("[DistinctRoleTenants]", StringComparison.Ordinal);
        var rowNumberCte = sql.IndexOf("[RoleTenants] AS", distinctCte + 1, StringComparison.Ordinal);
        Assert.True(distinctCte >= 0 && rowNumberCte > distinctCte);
        Assert.Contains("SELECT DISTINCT\n        [role].[Id] AS [OldRoleId]", sql);
        Assert.Contains("FROM [DistinctRoleTenants]", sql);
    }

    private static ApplicationDbContext CreateContext(string tenantId) => new(
        new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options,
        new TestCurrentActor("actor", tenantId),
        TimeProvider.System);

    private static RoleManager<ApplicationRole> CreateRoleManager(ApplicationDbContext context)
    {
        var errors = new IdentityErrorDescriber();
        return new RoleManager<ApplicationRole>(
            new RoleStore<ApplicationRole, ApplicationDbContext, string>(context),
            [new TenantRoleValidator(context, errors)],
            new UpperInvariantLookupNormalizer(),
            errors,
            NullLogger<RoleManager<ApplicationRole>>.Instance);
    }

    private static ApplicationRole CustomRole(string tenantId, string name, string? id = null) => new(name)
    {
        Id = id ?? Guid.NewGuid().ToString(),
        TenantId = tenantId,
        IsSystem = false,
        NormalizedName = name.ToUpperInvariant()
    };

    private static ApplicationRole SystemRole(string name, string id) => new(name)
    {
        Id = id,
        IsSystem = true,
        NormalizedName = name.ToUpperInvariant()
    };

    private static ApplicationUser CreateUser(string id, string tenantId) => new()
    {
        Id = id,
        TenantId = tenantId,
        FirstName = id,
        LastName = "Test",
        UserName = id,
        NormalizedUserName = id.ToUpperInvariant(),
        Email = $"{id}@example.com",
        NormalizedEmail = $"{id}@example.com".ToUpperInvariant()
    };

    private static IdentityUserRole<string> Assignment(string userId, string roleId) => new()
    {
        UserId = userId,
        RoleId = roleId
    };

    private static IdentityRoleClaim<string> RoleClaim(string roleId, string permission) => new()
    {
        RoleId = roleId,
        ClaimType = Permissions.Type,
        ClaimValue = permission
    };

    private sealed class TestCurrentActor(string? userId, string? tenantId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId => null;
    }

    private sealed class NullRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public void Dispatch(RealtimeChangeRequest request) { }
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Requests { get; } = [];

        public void Dispatch(RealtimeChangeRequest request) => Requests.Add(request);
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, resourceNotFound: true);
        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments), resourceNotFound: true);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
