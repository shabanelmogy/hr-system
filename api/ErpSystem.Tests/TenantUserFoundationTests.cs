using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Services;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;
using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;
using ErpSystem.Modules.HR.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.HR.Domain.Platform.SecurityAudits.Enums;
using ErpSystem.Modules.HR.Domain.Tenancy.Entities;
using ErpSystem.Modules.HR.Domain.Tenancy.Enums;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Tenancy.Services;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Services;
using ErpSystem.Modules.HR;
using ErpSystem.Modules.Accounting;
using ErpSystem.Modules.Platform;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Modules;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using System.Text.Json;
using PlatformEntitlementRequest = ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementRequest;
using PlatformEntitlementResponse = ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementResponse;
using PlatformEntitlementSource = ErpSystem.Modules.Platform.Contracts.Entitlements.ITenantModuleEntitlementSource;
using PlatformTenantAdministrationPolicy = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.ITenantAdministrationPolicy;

namespace ErpSystem.Tests;

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

        var entitlements = new TenantModuleEntitlementService(context);
        using var catalogProvider = CreateCatalogProvider(
            new ModuleCatalog([new HRModule(), new AccountingModule(), new PlatformModule()]),
            entitlements);
        var catalog = catalogProvider.GetRequiredService<IModuleCatalogPolicy>();
        var service = new TenantManagementService(
            context,
            new NullRealtimeDispatcher(),
            new NullSecurityAuditService(),
            TimeProvider.System,
            entitlements,
            catalog,
            catalogProvider.GetRequiredService<PlatformTenantAdministrationPolicy>(),
            NullLogger<TenantManagementService>.Instance);
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

    [Fact]
    public async Task TenantManagementCreate_ProvisionsDefaultCompanyEntitlementsAndAuditAtomically()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin", null),
            TimeProvider.System);
        var entitlements = new TenantModuleEntitlementService(context);
        using var catalogProvider = CreateCatalogProvider(
            new ModuleCatalog([new HRModule(), new AccountingModule(), new PlatformModule()]),
            entitlements);
        var service = CreateTenantManagementService(
            context,
            entitlements,
            catalogProvider,
            new PersistingSecurityAuditService(context),
            new NullRealtimeDispatcher());

        var result = await service.CreateAsync(CreateTenantRequest("acme"));

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.CompanyCount);
        var tenant = await context.Tenants.SingleAsync();
        var company = await context.Companies
            .IgnoreQueryFilters()
            .SingleAsync();
        Assert.Equal(tenant.Id, company.TenantId);
        Assert.Equal("DEFAULT", company.CompanyCode);
        Assert.Equal("Acme", company.NameEn);
        Assert.Equal("Acme", company.NameAr);
        Assert.Equal(
            catalogProvider.GetRequiredService<IModuleCatalogPolicy>().GetDefaultEntitlements().Count,
            await context.TenantModuleEntitlements.IgnoreQueryFilters().CountAsync());
        var audit = await context.SecurityAuditEvents.SingleAsync();
        Assert.Equal("TenantCreated", audit.Action);
        Assert.Equal(tenant.Id, audit.TargetId);
        Assert.Contains("DefaultCompanyCode", audit.MetadataJson);
    }

    [Fact]
    public async Task TenantManagementCreate_DuplicateIdentifierKeepsSingleTenantAndCompany()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin", null),
            TimeProvider.System);
        var entitlements = new TenantModuleEntitlementService(context);
        using var catalogProvider = CreateCatalogProvider(
            new ModuleCatalog([new HRModule(), new AccountingModule(), new PlatformModule()]),
            entitlements);
        var service = CreateTenantManagementService(
            context,
            entitlements,
            catalogProvider,
            new PersistingSecurityAuditService(context),
            new NullRealtimeDispatcher());

        var first = await service.CreateAsync(CreateTenantRequest("acme"));
        var second = await service.CreateAsync(CreateTenantRequest(" acme "));

        Assert.True(first.IsSuccess);
        Assert.True(second.IsFailure);
        Assert.Equal("Tenant.DuplicateIdentifier", second.Error.Code);
        Assert.Equal(1, await context.Tenants.CountAsync());
        Assert.Equal(1, await context.Companies.IgnoreQueryFilters().CountAsync());
    }

    [Fact]
    public async Task TenantManagementCreate_RealtimeFailureDoesNotFailCommittedProvisioning()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin", null),
            TimeProvider.System);
        var entitlements = new TenantModuleEntitlementService(context);
        using var catalogProvider = CreateCatalogProvider(
            new ModuleCatalog([new HRModule(), new AccountingModule(), new PlatformModule()]),
            entitlements);
        var service = CreateTenantManagementService(
            context,
            entitlements,
            catalogProvider,
            new PersistingSecurityAuditService(context),
            new ThrowingRealtimeDispatcher());

        var result = await service.CreateAsync(CreateTenantRequest("acme"));

        Assert.True(result.IsSuccess);
        Assert.Equal(1, await context.Tenants.CountAsync());
        Assert.Equal(1, await context.Companies.IgnoreQueryFilters().CountAsync());
    }

    [SqlServerFact]
    public async Task TenantManagementCreate_ConcurrentDuplicateIdentifierCreatesOneProvisioningSet()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("TenantProvisioningConcurrency");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(database.ConnectionString)
            .Options;
        await using (var setupContext = new ApplicationDbContext(
                         options,
                         new TestCurrentActor(null, null),
                         TimeProvider.System))
        {
            await setupContext.Database.EnsureCreatedAsync();
            setupContext.Tenants.Add(new Tenant(
                "platform",
                "platform",
                "Platform",
                DateTime.UtcNow));
            setupContext.Users.AddRange(
                CreateUser("platform-admin-1", "platform"),
                CreateUser("platform-admin-2", "platform"));
            await setupContext.SaveChangesAsync();
        }

        await using var firstContext = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin-1", null),
            TimeProvider.System);
        await using var secondContext = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin-2", null),
            TimeProvider.System);

        var firstEntitlements = new TenantModuleEntitlementService(firstContext);
        using var firstCatalogProvider = CreateCatalogProvider(
            new ModuleCatalog([new HRModule(), new AccountingModule(), new PlatformModule()]),
            firstEntitlements);
        var firstService = CreateTenantManagementService(
            firstContext,
            firstEntitlements,
            firstCatalogProvider,
            new PersistingSecurityAuditService(firstContext),
            new NullRealtimeDispatcher());

        var secondEntitlements = new TenantModuleEntitlementService(secondContext);
        using var secondCatalogProvider = CreateCatalogProvider(
            new ModuleCatalog([new HRModule(), new AccountingModule(), new PlatformModule()]),
            secondEntitlements);
        var secondService = CreateTenantManagementService(
            secondContext,
            secondEntitlements,
            secondCatalogProvider,
            new PersistingSecurityAuditService(secondContext),
            new NullRealtimeDispatcher());

        var results = await Task.WhenAll(
            firstService.CreateAsync(CreateTenantRequest("concurrent-tenant")),
            secondService.CreateAsync(CreateTenantRequest(" CONCURRENT-TENANT ")));

        Assert.Single(results, result => result.IsSuccess);
        var duplicate = Assert.Single(results, result => result.IsFailure);
        Assert.Equal("Tenant.DuplicateIdentifier", duplicate.Error.Code);
        var createdTenantId = results.Single(result => result.IsSuccess).Value.Id;

        await using var verificationContext = new ApplicationDbContext(
            options,
            new TestCurrentActor(null, null),
            TimeProvider.System);
        Assert.Equal(1, await verificationContext.Tenants
            .IgnoreQueryFilters()
            .CountAsync(item => item.Identifier == "concurrent-tenant"));
        Assert.Equal(1, await verificationContext.Companies
            .IgnoreQueryFilters()
            .CountAsync(item => item.TenantId == createdTenantId));
        Assert.Equal(1, await verificationContext.SecurityAuditEvents
            .IgnoreQueryFilters()
            .CountAsync(item => item.Action == "TenantCreated" && item.TenantId == createdTenantId));
    }

    [Fact]
    public async Task AddingAccountingEntitlement_PreservesHrSubmodules()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin", null),
            TimeProvider.System);
        var service = new TenantModuleEntitlementService(context);
        var hrSubmodules = new[] { "basic-data", "recruitment", "workforce" };

        await service.ApplyAsync("tenant-1", [
            new TenantModuleEntitlementRequest("hr", hrSubmodules)
        ]);
        await context.SaveChangesAsync();

        await service.ApplyAsync("tenant-1", [
            new TenantModuleEntitlementRequest("hr", hrSubmodules),
            new TenantModuleEntitlementRequest("acc", [])
        ]);
        await context.SaveChangesAsync();

        var saved = await service.GetAsync("tenant-1");
        Assert.Equal(["acc", "hr"], saved.Select(item => item.ModuleCode));
        Assert.Equal(hrSubmodules, saved.Single(item => item.ModuleCode == "hr").SubmoduleCodes);
    }

    [Fact]
    public async Task ModuleCatalog_DoesNotExposeOrAcceptTechnicalPlatformModule()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("platform-admin", null),
            TimeProvider.System);
        var entitlements = new TenantModuleEntitlementService(context);
        using var catalogProvider = CreateCatalogProvider(
            new ModuleCatalog(ErpSystem.Api.Modules.ErpModuleRegistry.Create()),
            entitlements);
        var catalog = catalogProvider.GetRequiredService<IModuleCatalogPolicy>();

        Assert.DoesNotContain(catalog.GetInstalled(), module => module.Code == "platform");
        Assert.Contains(catalog.GetInstalled(), module => module.Code == "hr");
        Assert.Contains(catalog.GetInstalled(), module => module.Code == "acc");
        Assert.DoesNotContain(catalog.GetDefaultEntitlements(), item => item.ModuleCode == "platform");
        Assert.False(catalog.IsValidEntitlement(
            [new PlatformEntitlementRequest("platform", [])],
            out var invalidCode));
        Assert.Equal("platform", invalidCode);
        Assert.True(catalog.IsValidEntitlement(
            [new PlatformEntitlementRequest("acc", [])],
            out _));
    }

    [Fact]
    public async Task SuperAdminAccessibleModules_StillExcludeTechnicalPlatformModule()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("super-admin", "tenant-1"),
            TimeProvider.System);
        var superAdminRole = new ApplicationRole(AppRoles.super_admin)
        {
            Id = "role-super-admin",
            IsSystem = true,
            NormalizedName = AppRoles.super_admin.ToUpperInvariant()
        };
        context.Roles.Add(superAdminRole);
        context.UserRoles.Add(new IdentityUserRole<string>
        {
            UserId = "super-admin",
            RoleId = superAdminRole.Id
        });
        await context.SaveChangesAsync();

        var entitlements = new TenantModuleEntitlementService(context);
        using var catalogProvider = CreateCatalogProvider(
            new ModuleCatalog(ErpSystem.Api.Modules.ErpModuleRegistry.Create()),
            entitlements);
        var catalog = catalogProvider.GetRequiredService<IModuleCatalogPolicy>();
        var accessible = await catalog.GetAccessibleAsync("super-admin", "tenant-1");

        Assert.DoesNotContain(accessible, module => module.Code == "platform");
        Assert.Contains(accessible, module => module.Code == "hr");
        Assert.Contains(accessible, module => module.Code == "acc");
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

    private static TenantManagementRequest CreateTenantRequest(string identifier) => new(
        identifier,
        "Acme",
        true,
        "free",
        DateTime.UtcNow,
        null,
        "starter",
        2,
        10,
        "billing@acme.example",
        "Acme Admin",
        "+201000000000",
        "Created by test");

    private static TenantManagementService CreateTenantManagementService(
        ApplicationDbContext context,
        TenantModuleEntitlementService entitlements,
        ServiceProvider catalogProvider,
        ISecurityAuditService securityAudit,
        IRealtimeChangeDispatcher realtimeChanges) =>
        new(
            context,
            realtimeChanges,
            securityAudit,
            TimeProvider.System,
            entitlements,
            catalogProvider.GetRequiredService<IModuleCatalogPolicy>(),
            catalogProvider.GetRequiredService<PlatformTenantAdministrationPolicy>(),
            NullLogger<TenantManagementService>.Instance);

    private static ServiceProvider CreateCatalogProvider(
        ModuleCatalog catalog,
        ITenantModuleEntitlementService entitlements)
    {
        var services = new ServiceCollection();
        services.AddSingleton(catalog);
        services.AddSingleton<PlatformEntitlementSource>(new HrEntitlementSource(entitlements));
        services.AddPlatformApplication();
        return services.BuildServiceProvider();
    }

    private sealed class HrEntitlementSource(ITenantModuleEntitlementService entitlements)
        : PlatformEntitlementSource
    {
        public Task ApplyAsync(
            string tenantId,
            IReadOnlyCollection<PlatformEntitlementRequest> requested,
            CancellationToken cancellationToken = default) =>
            entitlements.ApplyAsync(
                tenantId,
                requested.Select(item => new TenantModuleEntitlementRequest(
                    item.ModuleCode,
                    item.SubmoduleCodes)).ToArray(),
                cancellationToken);

        public Task<bool> HasAccessAsync(
            string tenantId,
            string moduleCode,
            string submoduleCode,
            CancellationToken cancellationToken = default) =>
            entitlements.HasAccessAsync(tenantId, moduleCode, submoduleCode, cancellationToken);

        public async Task<IReadOnlyList<PlatformEntitlementResponse>> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default) =>
            (await entitlements.GetAsync(tenantId, cancellationToken))
                .Select(item => new PlatformEntitlementResponse(item.ModuleCode, item.SubmoduleCodes))
                .ToArray();

        public Task<bool> UserHasPermissionAsync(
            string userId,
            string tenantId,
            string permission,
            CancellationToken cancellationToken = default) =>
            entitlements.UserHasPermissionAsync(userId, tenantId, permission, cancellationToken);

        public Task<IReadOnlySet<string>> GetUserPermissionsAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            entitlements.GetUserPermissionsAsync(userId, tenantId, cancellationToken);

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) =>
            entitlements.IsSuperAdminAsync(userId, cancellationToken);
    }

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

    private sealed class ThrowingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public void Dispatch(RealtimeChangeRequest request) =>
            throw new InvalidOperationException("Realtime infrastructure is unavailable.");
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

    private sealed class PersistingSecurityAuditService(ApplicationDbContext context) : ISecurityAuditService
    {
        public void Add(SecurityAuditRequest request)
        {
            context.SecurityAuditEvents.Add(new SecurityAuditEvent(
                Guid.NewGuid(),
                request.Action,
                request.TargetType,
                request.Outcome,
                DateTime.UtcNow,
                request.TenantId,
                request.CompanyId,
                null,
                request.TargetId,
                request.Reason,
                null,
                null,
                null,
                request.Metadata is null ? null : JsonSerializer.Serialize(request.Metadata)));
        }

        public async Task RecordAsync(
            SecurityAuditRequest request,
            CancellationToken cancellationToken = default)
        {
            Add(request);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
