using System.Reflection;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.SecurityAudits.Services;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.SecurityAudits.V1;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.SecurityAudits;
using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits;
using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits.Contracts;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PlatformSecurityAuditRequest = ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditRequest;
using PlatformSecurityAuditOutcome = ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditOutcome;
using PlatformSecurityAuditService = ErpSystem.Modules.Platform.Contracts.SecurityAudits.ISecurityAuditService;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformSecurityAuditOwnershipTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 9, 10, 19, 45, 0, TimeSpan.Zero);

    [Fact]
    public void RecordingOwnership_IsContainedWithinPlatformBoundaries()
    {
        var platformContractsReferences = typeof(PlatformSecurityAuditService).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformApplicationReferences = typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);

        Assert.Equal(
            "ErpSystem.Modules.Platform.Contracts",
            typeof(PlatformSecurityAuditService).Assembly.GetName().Name);
    }

    [Fact]
    public async Task PlatformApplication_OwnsCanonicalRecordingPolicyAndSaveBoundary()
    {
        var store = new RecordingStore();
        var services = new ServiceCollection();
        services.AddSingleton<ICurrentExecutionContext>(
            new TestExecutionContext(" actor-user ", " actor-tenant ", 7));
        services.AddSingleton<ISecurityAuditRequestContextSource>(
            new TestRequestContextSource(new SecurityAuditRequestContext(
                new string('i', 70),
                new string('u', 520),
                new string('c', 140))));
        services.AddSingleton<ISecurityAuditStore>(store);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<PlatformSecurityAuditService>();
        var metadata = new Dictionary<string, string?>
        {
            ["AffectedUsersCount"] = "2",
            ["Optional"] = null
        };

        service.Add(new PlatformSecurityAuditRequest(
            " RoleUpdated ",
            " ApplicationRole ",
            new string('t', 451),
            PlatformSecurityAuditOutcome.Denied,
            new string('r', 1001),
            Metadata: metadata));

        Assert.Equal(0, store.SaveCount);
        var record = Assert.Single(store.Records);
        Assert.NotEqual(Guid.Empty, record.Id);
        Assert.Equal("actor-tenant", record.TenantId);
        Assert.Equal(7, record.CompanyId);
        Assert.Equal("actor-user", record.ActorUserId);
        Assert.Equal("RoleUpdated", record.Action);
        Assert.Equal("ApplicationRole", record.TargetType);
        Assert.Equal(450, record.TargetId!.Length);
        Assert.Equal(1000, record.Reason!.Length);
        Assert.Equal(64, record.IpAddress!.Length);
        Assert.Equal(512, record.UserAgent!.Length);
        Assert.Equal(128, record.CorrelationId!.Length);
        Assert.Equal(PlatformSecurityAuditOutcome.Denied, record.Outcome);
        Assert.Equal(Now.UtcDateTime, record.OccurredOn);
        Assert.NotNull(record.MetadataJson);
        Assert.Equal(metadata, JsonSerializer.Deserialize<Dictionary<string, string?>>(record.MetadataJson!));

        await service.RecordAsync(new PlatformSecurityAuditRequest(
            "LoginSucceeded",
            "ApplicationUser",
            TenantId: " explicit-tenant ",
            CompanyId: 11));

        Assert.Equal(1, store.SaveCount);
        Assert.Equal("explicit-tenant", store.Records[1].TenantId);
        Assert.Equal(11, store.Records[1].CompanyId);
    }

    [Fact]
    public void PlatformApplication_RejectsSensitiveMetadataBeforePersistence()
    {
        var store = new RecordingStore();
        var services = new ServiceCollection();
        services.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext(null, null, null));
        services.AddSingleton<ISecurityAuditRequestContextSource>(
            new TestRequestContextSource(new SecurityAuditRequestContext(null, null, null)));
        services.AddSingleton<ISecurityAuditStore>(store);
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<PlatformSecurityAuditService>();

        var exception = Assert.Throws<ArgumentException>(() => service.Add(
            new PlatformSecurityAuditRequest(
                "Login",
                "ApplicationUser",
                Metadata: new Dictionary<string, string?> { ["RefreshToken"] = "forbidden" })));

        Assert.Contains("RefreshToken", exception.Message, StringComparison.Ordinal);
        Assert.Empty(store.Records);
    }

    [Fact]
    public async Task PlatformPersistenceStore_PreservesOutcomeAndPhysicalEntity()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new PlatformDbContext(
            options,
            new TestExecutionContext("user-1", "tenant-1", 5));
        var store = new SecurityAuditStore(context);
        var id = Guid.NewGuid();
        store.Add(new SecurityAuditRecord(
            id,
            "tenant-1",
            5,
            "user-1",
            "Action",
            "Target",
            "target-1",
            PlatformSecurityAuditOutcome.Succeeded,
            null,
            null,
            null,
            null,
            null,
            Now.UtcDateTime));
        await store.SaveChangesAsync();

        var entity = await context.SecurityAuditEvents.SingleAsync(audit => audit.Id == id);
        Assert.Equal(
            ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums.SecurityAuditOutcome.Succeeded,
            entity.Outcome);
        Assert.Equal("SecurityAuditEvents", context.Model.FindEntityType(typeof(SecurityAuditEvent))!.GetTableName());
        Assert.Equal(PlatformDbContext.Schema, context.Model.FindEntityType(typeof(SecurityAuditEvent))!.GetSchema());
    }

    [Fact]
    public void ExistingQueryWireContract_RemainsPlatformOwnedAndUnchanged()
    {
        var method = typeof(SecurityAuditsController).GetMethod(nameof(SecurityAuditsController.GetAll));
        Assert.NotNull(method);
        Assert.Equal(
            typeof(ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits.Contracts.SecurityAuditQueryRequest),
            method!.GetParameters()[0].ParameterType);
        Assert.Equal("getAll", method.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits.Contracts.SecurityAuditPageResponse)
                .Assembly.GetName().Name);
    }

    [Fact]
    public async Task SecurityAuditQuery_NonPlatformAdminRequiresCurrentCompanyAndCannotSelectAnotherCompany()
    {
        var request = new SecurityAuditQueryRequest { CompanyId = 99 };
        var missingCompanyStore = new RecordingReadStore();
        var missingCompanyHandler = new GetSecurityAuditsQueryHandler(
            missingCompanyStore,
            new TestExecutionContext("user-1", "tenant-1", null));

        var denied = await missingCompanyHandler.Handle(
            new GetSecurityAuditsQuery(request),
            CancellationToken.None);

        Assert.True(denied.IsFailure);
        Assert.Equal("SecurityAudit.MissingCompany", denied.Error.Code);
        Assert.Equal(0, missingCompanyStore.CallCount);

        var scopedStore = new RecordingReadStore();
        var scopedHandler = new GetSecurityAuditsQueryHandler(
            scopedStore,
            new TestExecutionContext("user-1", "tenant-1", 7));

        var allowed = await scopedHandler.Handle(
            new GetSecurityAuditsQuery(request),
            CancellationToken.None);

        Assert.True(allowed.IsSuccess);
        Assert.Equal(1, scopedStore.CallCount);
        Assert.NotNull(scopedStore.Scope);
        Assert.False(scopedStore.Scope!.IsPlatformAdministrator);
        Assert.Equal("tenant-1", scopedStore.Scope.TenantId);
        Assert.Equal(7, scopedStore.Scope.CompanyId);
    }

    private sealed class RecordingStore : ISecurityAuditStore
    {
        public List<SecurityAuditRecord> Records { get; } = [];
        public int SaveCount { get; private set; }

        public void Add(SecurityAuditRecord record) => Records.Add(record);

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveCount++;
            return Task.CompletedTask;
        }
    }

    private sealed class RecordingReadStore : ISecurityAuditReadStore
    {
        public int CallCount { get; private set; }
        public SecurityAuditReadScope? Scope { get; private set; }

        public Task<SecurityAuditPageResponse> GetAsync(
            SecurityAuditQueryRequest request,
            SecurityAuditReadScope scope,
            CancellationToken cancellationToken = default)
        {
            CallCount++;
            Scope = scope;
            return Task.FromResult(new SecurityAuditPageResponse([], new MetaData()));
        }
    }

    private sealed class TestRequestContextSource(SecurityAuditRequestContext context)
        : ISecurityAuditRequestContextSource
    {
        public SecurityAuditRequestContext GetCurrent() => context;
    }

    private sealed class TestExecutionContext(string? userId, string? tenantId, int? companyId)
        : ICurrentActor
    {
        public string? UserId => userId;
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}

