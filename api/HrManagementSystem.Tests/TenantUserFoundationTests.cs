using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Tenancy.Contracts;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Platform.SecurityAudits.Entities;
using HrManagementSystem.Domain.Platform.SecurityAudits.Enums;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.Tenancy.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Features.Tenancy.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class TenantUserFoundationTests
{
    [Fact]
    public async Task NewCompany_GrantsCreatorAndEveryActiveTenantAdministrator()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        var actor = new TestCurrentActor("creator", "tenant-1");

        await using var context = new ApplicationDbContext(options, actor, TimeProvider.System);
        var tenant = new Tenant("tenant-1", "tenant-1", "Tenant 1", DateTime.UtcNow);
        var administrator = CreateUser("administrator", "tenant-1");
        var creator = CreateUser("creator", "tenant-1");
        var role = new ApplicationRole(AppRoles.admin)
        {
            Id = "admin-role",
            IsSystem = true,
            NormalizedName = AppRoles.admin.ToUpperInvariant()
        };

        context.AddRange(tenant, administrator, creator, role);
        context.UserRoles.Add(new IdentityUserRole<string>
        {
            UserId = administrator.Id,
            RoleId = role.Id
        });
        context.UserTenantAccesses.Add(new UserTenantAccess
        {
            TenantId = tenant.Id,
            UserId = administrator.Id,
            IsDefault = true
        });
        await context.SaveChangesAsync();

        var company = new Company("NEW", "New company", "New company", "EGP", "Africa/Cairo")
        {
            TenantId = tenant.Id
        };
        context.Companies.Add(company);
        await context.SaveChangesAsync();

        var grantedUserIds = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .Where(access => access.CompanyId == company.Id)
            .Select(access => access.UserId)
            .OrderBy(userId => userId)
            .ToArrayAsync();

        Assert.Equal([administrator.Id, creator.Id], grantedUserIds);
    }

    [Fact]
    public async Task SecurityAuditEvents_CannotBeModifiedOrDeleted()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor(null, null),
            TimeProvider.System);
        var audit = new SecurityAuditEvent(
            Guid.NewGuid(),
            "UserArchived",
            "ApplicationUser",
            SecurityAuditOutcome.Succeeded,
            DateTime.UtcNow,
            null,
            null,
            null,
            "user-1",
            null,
            null,
            null,
            null,
            null);
        context.SecurityAuditEvents.Add(audit);
        await context.SaveChangesAsync();

        context.Entry(audit).Property(item => item.Reason).CurrentValue = "changed";
        context.Entry(audit).State = EntityState.Modified;
        await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());

        context.Entry(audit).State = EntityState.Unchanged;
        context.SecurityAuditEvents.Remove(audit);
        await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());
    }

    [Fact]
    public void TenantArchiveAndRestore_PreserveLifecycleMetadata()
    {
        var archivedOn = new DateTime(2026, 8, 14, 12, 0, 0, DateTimeKind.Utc);
        var tenant = new Tenant("tenant-1", "tenant-1", "Tenant 1", archivedOn.AddDays(-1));

        tenant.Archive("Contract ended", archivedOn, archivedOn.AddDays(30));

        Assert.Equal(TenantLifecycleStatus.PurgeScheduled, tenant.LifecycleStatus);
        Assert.False(tenant.IsActive);
        Assert.Equal("Contract ended", tenant.ArchiveReason);

        tenant.Restore(archivedOn.AddDays(1));

        Assert.Equal(TenantLifecycleStatus.Active, tenant.LifecycleStatus);
        Assert.True(tenant.IsActive);
        Assert.Null(tenant.ArchiveReason);
        Assert.Null(tenant.PurgeScheduledOn);
    }

    [Fact]
    public async Task TenantManagementPage_AppliesDatabasePagingAndSearch()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin", null),
            TimeProvider.System);

        for (var index = 1; index <= 7; index++)
        {
            context.Tenants.Add(new Tenant(
                $"tenant-{index}",
                $"tenant-{index}",
                $"Managed {index}",
                DateTime.UtcNow.AddMinutes(index)));
        }
        await context.SaveChangesAsync();

        var service = new TenantManagementService(
            context,
            new NullRealtimeDispatcher(),
            new NullSecurityAuditService(),
            TimeProvider.System);
        var page = await service.GetPageAsync(new TenantManagementQuery
        {
            PageNumber = 2,
            PageSize = 3,
            SearchValue = "Managed",
            ColumnName = "Name",
            SortDirection = "ASC"
        });

        Assert.Equal(7, page.MetaData.TotalCount);
        Assert.Equal(3, page.MetaData.TotalPages);
        Assert.Equal(["Managed 4", "Managed 5", "Managed 6"], page.Items.Select(item => item.Name));
    }

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

    private sealed class TestCurrentActor(
        string? userId,
        string? tenantId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId => null;
    }

    private sealed class NullRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public void Dispatch(RealtimeChangeRequest request)
        {
        }
    }

    private sealed class NullSecurityAuditService : ISecurityAuditService
    {
        public void Add(SecurityAuditRequest request)
        {
        }

        public Task RecordAsync(
            SecurityAuditRequest request,
            CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
