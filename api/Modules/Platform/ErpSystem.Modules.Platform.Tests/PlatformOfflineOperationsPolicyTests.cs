using System.Reflection;
using Asp.Versioning;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.OfflineOperations;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Presentation.Features.OfflineOperations.V1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.DependencyInjection;
using MediatR;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformOfflineOperationsPolicyTests
{
    [Fact]
    public void Ownership_KeepsAuthorizationPermissionInCanonicalPlatformPermissionCatalog()
    {
        Assert.Equal(
            "ErpSystem.Modules.Platform.Contracts",
            typeof(PlatformPermissions).Assembly.GetName().Name);
        Assert.Equal("OfflineOperations:Manage", PlatformPermissions.ManageOfflineOperations);
        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(OfflineOperationCapabilityIds).Assembly.GetName().Name);
        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(OfflineOperationModes).Assembly.GetName().Name);

        var publicOfflineContractTypes = typeof(PlatformPermissions).Assembly.GetTypes()
            .Where(type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.OfflineOperations",
                StringComparison.Ordinal))
            .ToArray();

        Assert.Empty(publicOfflineContractTypes);
    }

    [Fact]
    public async Task MissingPolicy_FailsClosedToOnlineOnlyForEveryKnownCapability()
    {
        var store = new RecordingStore();
        using var provider = BuildProvider(
            new TestExecutionContext("user-1", "tenant-1", 7),
            store);

        var response = await provider.GetRequiredService<ISender>()
            .Send(new GetOfflineOperationsPolicyQuery());

        Assert.Equal(1, response.Version);
        Assert.Equal("tenant-1", response.TenantId);
        Assert.Equal(7, response.CompanyId);
        Assert.Null(response.RowVersion);
        Assert.Equal(OfflineOperationModes.OnlineOnly, response.Modes[OfflineOperationCapabilityIds.CountriesRead]);
        Assert.Equal(OfflineOperationModes.OnlineOnly, response.Modes[OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft]);
        Assert.Contains(response.Capabilities, capability =>
            capability.Id == OfflineOperationCapabilityIds.CountriesRead &&
            capability.SupportedModes.SequenceEqual(
                [OfflineOperationModes.OnlineOnly, OfflineOperationModes.OfflineRead]));
        Assert.Contains(response.Capabilities, capability =>
            capability.Id == OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft &&
            capability.SupportedModes.SequenceEqual(
                [OfflineOperationModes.OnlineOnly, OfflineOperationModes.OfflineDraft, OfflineOperationModes.OfflineCommand]));
    }

    [Fact]
    public async Task Update_RejectsUnsupportedModeBeforePersistence()
    {
        var store = new RecordingStore();
        using var provider = BuildProvider(
            new TestExecutionContext("admin-1", "tenant-1", 7),
            store);
        var sender = provider.GetRequiredService<ISender>();

        var exception = await Assert.ThrowsAsync<OfflineOperationsPolicyValidationException>(() =>
            sender.Send(new UpdateOfflineOperationsPolicyCommand(new UpdateOfflineOperationsPolicyRequest(
                new Dictionary<string, string>
                {
                    [OfflineOperationCapabilityIds.CountriesRead] = OfflineOperationModes.OfflineRead,
                    [OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft] = OfflineOperationModes.OfflineRead
                },
                RowVersion: null))));

        Assert.Contains(OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft, exception.Message);
        Assert.Equal(0, store.SaveCalls);
    }

    [Fact]
    public async Task Update_AllowsCertifiedWorkforceOfflineCommandMode()
    {
        var store = new RecordingStore();
        using var provider = BuildProvider(
            new TestExecutionContext("admin-1", "tenant-1", 7),
            store);

        var response = await provider.GetRequiredService<ISender>()
            .Send(new UpdateOfflineOperationsPolicyCommand(new UpdateOfflineOperationsPolicyRequest(
                new Dictionary<string, string>
                {
                    [OfflineOperationCapabilityIds.CountriesRead] = OfflineOperationModes.OfflineRead,
                    [OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft] = OfflineOperationModes.OfflineCommand
                },
                RowVersion: null)));

        Assert.Equal(1, store.SaveCalls);
        Assert.Equal(
            OfflineOperationModes.OfflineCommand,
            response.Modes[OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft]);
    }

    [Fact]
    public async Task Update_UsesCurrentTenantCompanyActorAndOptimisticConcurrencyToken()
    {
        var expected = new byte[] { 1, 2, 3, 4 };
        var saved = new byte[] { 5, 6, 7, 8 };
        var store = new RecordingStore
        {
            SaveResult = new OfflineOperationsPolicyStoreRecord(
                "tenant-a",
                42,
                new Dictionary<string, string>
                {
                    [OfflineOperationCapabilityIds.CountriesRead] = OfflineOperationModes.OfflineRead,
                    [OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft] = OfflineOperationModes.OnlineOnly
                },
                saved,
                new DateTimeOffset(2026, 9, 11, 4, 0, 0, TimeSpan.Zero),
                "admin-a")
        };
        using var provider = BuildProvider(
            new TestExecutionContext("admin-a", "tenant-a", 42),
            store,
            new FrozenTimeProvider(new DateTimeOffset(2026, 9, 11, 4, 0, 0, TimeSpan.Zero)));

        var response = await provider.GetRequiredService<ISender>()
            .Send(new UpdateOfflineOperationsPolicyCommand(new UpdateOfflineOperationsPolicyRequest(
                new Dictionary<string, string>
                {
                    [OfflineOperationCapabilityIds.CountriesRead] = OfflineOperationModes.OfflineRead,
                    [OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft] = OfflineOperationModes.OnlineOnly
                },
                Convert.ToBase64String(expected))));

        Assert.Equal(1, store.SaveCalls);
        Assert.NotNull(store.LastSave);
        Assert.Equal("tenant-a", store.LastSave!.TenantId);
        Assert.Equal(42, store.LastSave.CompanyId);
        Assert.Equal("admin-a", store.LastSave.UpdatedByUserId);
        Assert.Equal(expected, store.LastSave.ExpectedRowVersion);
        Assert.Equal(Convert.ToBase64String(saved), response.RowVersion);
    }

    [Fact]
    public async Task MissingSelectedCompany_IsRejected()
    {
        using var provider = BuildProvider(
            new TestExecutionContext("user-1", "tenant-1", null),
            new RecordingStore());

        await Assert.ThrowsAsync<OfflineOperationsPolicyScopeException>(() =>
            provider.GetRequiredService<ISender>().Send(new GetOfflineOperationsPolicyQuery()));
    }

    [Fact]
    public void Presentation_OwnsVersionedReadAndPermissionProtectedWriteRoutes()
    {
        var controller = typeof(OfflineOperationsController);
        Assert.Equal("1.0", controller.GetCustomAttribute<ApiVersionAttribute>()?.Versions.Single().ToString());
        Assert.Equal(
            "api/v{version:apiVersion}/offline-operations",
            controller.GetCustomAttribute<RouteAttribute>()?.Template);
        Assert.NotNull(controller.GetCustomAttribute<AuthorizeAttribute>());

        var get = controller.GetMethod(nameof(OfflineOperationsController.GetPolicy))!;
        Assert.Equal("policy", Assert.Single(get.GetCustomAttributes<HttpGetAttribute>()).Template);
        Assert.NotNull(get.GetCustomAttribute<TenantMemberAttribute>());
        Assert.Null(get.GetCustomAttribute<HasPermissionAttribute>());

        var update = controller.GetMethod(nameof(OfflineOperationsController.UpdatePolicy))!;
        Assert.Equal("policy", Assert.Single(update.GetCustomAttributes<HttpPutAttribute>()).Template);
        Assert.NotNull(update.GetCustomAttribute<TenantMemberAttribute>());
        Assert.Equal(
            PlatformPermissions.ManageOfflineOperations,
            update.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    [Fact]
    public void PlatformModel_OwnsPolicyHistoryUniqueScopeAndRowVersion()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=erp-platform-model-test;Trusted_Connection=True")
            .Options;
        using var db = new PlatformDbContext(options);

        var policy = db.Model.GetEntityTypes().Single(entity =>
            entity.GetTableName() == "OfflineOperationsPolicies");
        Assert.Equal(PlatformDbContext.Schema, policy.GetSchema());
        var rowVersion = policy.FindProperty("RowVersion")!;
        Assert.True(rowVersion.IsConcurrencyToken);
        Assert.Equal(ValueGenerated.OnAddOrUpdate, rowVersion.ValueGenerated);
        Assert.Contains(policy.GetIndexes(), index =>
            index.IsUnique &&
            index.Properties.Select(property => property.Name)
                .SequenceEqual(["TenantId", "CompanyId"]));

        var history = db.Model.GetEntityTypes().Single(entity =>
            entity.GetTableName() == "OfflineOperationsPolicyHistory");
        Assert.Equal(PlatformDbContext.Schema, history.GetSchema());
    }

    private static ServiceProvider BuildProvider(
        ICurrentExecutionContext executionContext,
        IOfflineOperationsPolicyStore store,
        TimeProvider? timeProvider = null)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(executionContext);
        services.AddSingleton(store);
        if (timeProvider is not null)
            services.AddSingleton(timeProvider);
        services.AddPlatformApplication();
        return services.BuildServiceProvider();
    }

    private sealed class TestExecutionContext(
        string? userId,
        string? tenantId,
        int? companyId) : ICurrentExecutionContext
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class RecordingStore : IOfflineOperationsPolicyStore
    {
        public int SaveCalls { get; private set; }
        public SaveOfflineOperationsPolicyRequest? LastSave { get; private set; }
        public OfflineOperationsPolicyStoreRecord? ReadResult { get; init; }
        public OfflineOperationsPolicyStoreRecord? SaveResult { get; init; }

        public Task<OfflineOperationsPolicyStoreRecord?> GetAsync(
            string tenantId,
            int companyId,
            CancellationToken cancellationToken = default) => Task.FromResult(ReadResult);

        public Task<OfflineOperationsPolicyStoreRecord> SaveAsync(
            SaveOfflineOperationsPolicyRequest request,
            CancellationToken cancellationToken = default)
        {
            SaveCalls++;
            LastSave = request;
            return Task.FromResult(SaveResult ?? new OfflineOperationsPolicyStoreRecord(
                request.TenantId,
                request.CompanyId,
                request.Modes,
                [9, 9, 9],
                request.UpdatedOn,
                request.UpdatedByUserId));
        }
    }

    private sealed class FrozenTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}

