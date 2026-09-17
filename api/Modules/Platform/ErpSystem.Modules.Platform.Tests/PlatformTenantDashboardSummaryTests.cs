using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Presentation.Features.Tenancy.V1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformTenantDashboardSummaryTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 9, 17, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void DashboardSummary_UsesDedicatedCqrsAndSuperAdminControllerSurface()
    {
        Assert.IsAssignableFrom<IQuery<TenantDashboardSummaryResponse>>(
            new GetTenantDashboardSummaryQuery());

        var constructorParameters = Assert.Single(
                typeof(PlatformTenantDashboardSummaryAdapter).GetConstructors())
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();
        Assert.Equal([typeof(PlatformDbContext), typeof(TimeProvider)], constructorParameters);

        var authorize = Assert.Single(
            typeof(TenantsController).GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
                .Cast<AuthorizeAttribute>());
        Assert.Equal(PlatformRoleNames.SuperAdmin, authorize.Roles);

        var action = typeof(TenantsController).GetMethod(nameof(TenantsController.GetDashboardSummary));
        Assert.NotNull(action);
        Assert.NotNull(action!.GetCustomAttributes(typeof(HttpGetAttribute), inherit: true).SingleOrDefault());
    }

    [Fact]
    public async Task DashboardSummary_ReturnsAggregateCountsAndBoundedListsWithoutArchivedTenants()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var db = new PlatformDbContext(options);
        var activeTenants = new List<PlatformTenant>();
        var statuses = new[]
        {
            TenantSubscriptionStatus.Active,
            TenantSubscriptionStatus.Trial,
            TenantSubscriptionStatus.Active,
            TenantSubscriptionStatus.PastDue,
            TenantSubscriptionStatus.Suspended,
            TenantSubscriptionStatus.Cancelled,
            TenantSubscriptionStatus.Free,
            TenantSubscriptionStatus.Active,
            TenantSubscriptionStatus.Active,
            TenantSubscriptionStatus.Active
        };

        for (var index = 0; index < statuses.Length; index++)
        {
            var endsOn = index == 0
                ? Now.UtcDateTime.AddDays(-1)
                : Now.UtcDateTime.AddDays(index);
            var tenant = CreateTenant(
                $"tenant-{index}",
                statuses[index],
                Now.UtcDateTime.AddDays(-30 + index),
                endsOn,
                isActive: index != 9);
            activeTenants.Add(tenant);
            db.Tenants.Add(tenant);
        }

        var archived = CreateTenant(
            "tenant-archived",
            TenantSubscriptionStatus.Active,
            Now.UtcDateTime.AddDays(1),
            Now.UtcDateTime.AddDays(2),
            isActive: true,
            maxAdmins: 100,
            maxUsers: 1000);
        archived.Archive("archived for test", Now.UtcDateTime, null);
        db.Tenants.Add(archived);

        var adminRole = new PlatformApplicationRole
        {
            Id = "admin-role",
            Name = PlatformRoleNames.Admin,
            NormalizedName = PlatformRoleNames.Admin.ToUpperInvariant(),
            IsSystem = true
        };
        var userRole = new PlatformApplicationRole
        {
            Id = "user-role",
            Name = PlatformRoleNames.User,
            NormalizedName = PlatformRoleNames.User.ToUpperInvariant(),
            IsSystem = true
        };
        db.Roles.AddRange(adminRole, userRole);

        var admin = CreateUser("admin-user");
        var user = CreateUser("regular-user");
        var archivedAdmin = CreateUser("archived-admin");
        db.Users.AddRange(admin, user, archivedAdmin);
        db.UserRoles.AddRange(
            new IdentityUserRole<string> { UserId = admin.Id, RoleId = adminRole.Id },
            new IdentityUserRole<string> { UserId = user.Id, RoleId = userRole.Id },
            new IdentityUserRole<string> { UserId = archivedAdmin.Id, RoleId = adminRole.Id });

        db.UserTenantAccesses.AddRange(
            Access(admin.Id, activeTenants[0].Id),
            Access(admin.Id, activeTenants[1].Id),
            Access(user.Id, activeTenants[0].Id),
            Access(archivedAdmin.Id, archived.Id));

        db.Companies.AddRange(
            CreateCompany(activeTenants[0].Id, "A"),
            CreateCompany(activeTenants[1].Id, "B"),
            CreateCompany(archived.Id, "ARCHIVED"));

        await db.SaveChangesAsync();

        var adapter = new PlatformTenantDashboardSummaryAdapter(db, new FixedTimeProvider(Now));
        var summary = await adapter.GetSummaryAsync();

        Assert.Equal(10, summary.TotalTenants);
        Assert.Equal(9, summary.EnabledTenants);
        Assert.Equal(2, summary.Admins);
        Assert.Equal(1, summary.Users);
        Assert.Equal(2, summary.Companies);
        Assert.Equal(20, summary.MaxAdmins);
        Assert.Equal(100, summary.MaxUsers);
        Assert.Equal(9, summary.ExpiringWithin30Days);

        Assert.Equal(1, summary.SubscriptionStatusCounts.Free);
        Assert.Equal(1, summary.SubscriptionStatusCounts.Trial);
        Assert.Equal(4, summary.SubscriptionStatusCounts.Active);
        Assert.Equal(1, summary.SubscriptionStatusCounts.PastDue);
        Assert.Equal(1, summary.SubscriptionStatusCounts.Suspended);
        Assert.Equal(1, summary.SubscriptionStatusCounts.Expired);
        Assert.Equal(1, summary.SubscriptionStatusCounts.Cancelled);

        Assert.Equal(8, summary.RecentTenants.Count);
        Assert.DoesNotContain(summary.RecentTenants, tenant => tenant.Id == archived.Id);
        Assert.Equal(8, summary.ExpiringWithin30DaysTenants.Count);
        Assert.True(summary.ExpiringWithin30DaysTenants
            .Select(tenant => tenant.SubscriptionEndsOn)
            .SequenceEqual(summary.ExpiringWithin30DaysTenants
                .Select(tenant => tenant.SubscriptionEndsOn)
                .OrderBy(value => value)));
        Assert.DoesNotContain(summary.ExpiringWithin30DaysTenants, tenant => tenant.Id == archived.Id);
    }

    private static PlatformTenant CreateTenant(
        string id,
        TenantSubscriptionStatus status,
        DateTime createdOn,
        DateTime? endsOn,
        bool isActive,
        int maxAdmins = 2,
        int maxUsers = 10)
    {
        var tenant = new PlatformTenant(id, id, $"Tenant {id}", createdOn);
        tenant.Update(
            id,
            $"Tenant {id}",
            isActive,
            (int)status,
            createdOn,
            endsOn,
            "Plan",
            maxAdmins,
            maxUsers,
            null,
            null,
            null,
            null,
            createdOn);
        return tenant;
    }

    private static PlatformApplicationUser CreateUser(string id) => new()
    {
        Id = id,
        FirstName = id,
        LastName = "User",
        UserName = id,
        NormalizedUserName = id.ToUpperInvariant(),
        LifecycleStatus = (int)PlatformUserLifecycleStatus.Active
    };

    private static PlatformUserTenantAccess Access(string userId, string tenantId) => new()
    {
        UserId = userId,
        TenantId = tenantId,
        CreatedOn = Now.UtcDateTime
    };

    private static PlatformCompany CreateCompany(string tenantId, string code) =>
        new(tenantId, code, $"Company {code}", $"Company {code}", "EGP", "Africa/Cairo", Now.UtcDateTime);

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
