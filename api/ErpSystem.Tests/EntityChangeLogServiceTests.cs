using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Domain.Platform.EntityChangeLogs.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class EntityChangeLogServiceTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 9, 11, 8, 30, 0, TimeSpan.Zero);

    [Fact]
    public void ApplicationOwnership_IsPlatformOwnedAndHrAdapterExposesOnlyPersistencePorts()
    {
        var store = new RecordingStore();
        using var provider = BuildProvider(store, store, new TestCurrentActor("actor-1", "tenant-1", 7));
        var service = provider.GetRequiredService<IEntityChangeLogService>();

        Assert.Equal("ErpSystem.Modules.Platform.Application", service.GetType().Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", typeof(IEntityChangeLogService).Assembly.GetName().Name);
        Assert.Contains(typeof(IEntityChangeLogStore), typeof(EntityChangeLogPersistenceAdapter).GetInterfaces());
        Assert.Contains(typeof(IEntityChangeLogQueryStore), typeof(EntityChangeLogPersistenceAdapter).GetInterfaces());
        Assert.DoesNotContain(typeof(IEntityChangeLogService), typeof(EntityChangeLogPersistenceAdapter).GetInterfaces());
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Features.Platform.EntityChangeLogs.Services.IEntityChangeLogService"));
    }

    [Fact]
    public async Task CreateChangeLogAsync_PlatformOwnsDiffSerializationActorAndTimePolicy()
    {
        var store = new RecordingStore();
        using var provider = BuildProvider(store, store, new TestCurrentActor("actor-1", "tenant-1", 7));
        var service = provider.GetRequiredService<IEntityChangeLogService>();

        var result = await service.CreateChangeLogAsync(
            "user-123",
            "ApplicationUser",
            new UserSnapshot("Before", false, 4, "created-before"),
            new UserSnapshot("After", true, 7, "created-after"));

        Assert.NotNull(result);
        Assert.Equal("user-123", result.EntityKey);
        Assert.Equal("actor-1", result.ChangedById);
        var persisted = Assert.Single(store.Added);
        Assert.Equal(Now.UtcDateTime, persisted.ChangedAt);
        Assert.Equal("actor-1", persisted.ChangedById);
        Assert.DoesNotContain("CreatedById", persisted.JsonOldValues, StringComparison.Ordinal);
        Assert.Contains("\"Name\":\"Before\"", persisted.JsonOldValues, StringComparison.Ordinal);
        Assert.Contains("\"IsDisabled\":false", persisted.JsonOldValues, StringComparison.Ordinal);
        Assert.Contains("\"CompanyId\":4", persisted.JsonOldValues, StringComparison.Ordinal);
        Assert.Contains("\"Name\":\"After\"", persisted.JsonNewValues, StringComparison.Ordinal);
    }

    [Fact]
    public async Task QueryPolicy_PreservesExistingAllAndEntityWireProjectionSemantics()
    {
        var store = new RecordingStore();
        store.Rows.Add(new EntityChangeLogQueryRecord(
            Id: 91,
            EntityId: 4,
            EntityKey: "user-123",
            EntityName: "ApplicationUser",
            JsonOldValues: "{\"Name\":\"Before\",\"Removed\":\"Old\"}",
            JsonNewValues: "{\"Name\":\"After\",\"Added\":true}",
            ChangedAt: Now.UtcDateTime,
            ChangedByPc: "machine",
            ChangedByUserExists: false,
            ChangedByUserName: null));
        using var provider = BuildProvider(store, store, new TestCurrentActor("actor-1", "tenant-1", 7));
        var service = provider.GetRequiredService<IEntityChangeLogService>();

        var all = await service.GetChangeLogKeyValuesAsync();
        var byEntity = await service.GetChangeLogsByEntityAsync(" ApplicationUser ", 4);

        var common = Assert.Single(all);
        Assert.Equal("user-123", common.ChangeLogId);
        Assert.Equal("Name", common.Key);
        Assert.Equal("Before", common.OldValue);
        Assert.Equal("After", common.NewValue);
        Assert.Equal("Unknown User", common.ChangedBy);

        Assert.Equal(["Added", "Name", "Removed"], byEntity.Select(item => item.Key).OrderBy(key => key).ToArray());
        Assert.All(byEntity, item => Assert.Equal("91", item.ChangeLogId));
        Assert.All(byEntity, item => Assert.Equal("System", item.ChangedBy));
        Assert.Equal("ApplicationUser", store.LastEntityName);
        Assert.Equal(4, store.LastEntityId);
    }

    [Fact]
    public async Task LegacyHrAdapter_PreservesPhysicalTableScopeAndIdentityLookup()
    {
        var actor = new TestCurrentActor("actor-1", "tenant-1", 7);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(options, actor, TimeProvider.System);
        var adapter = new EntityChangeLogPersistenceAdapter(context);

        await adapter.AddAsync(new EntityChangeLogRecord(
            4,
            "user-123",
            "ApplicationUser",
            "{\"Name\":\"Before\"}",
            "{\"Name\":\"After\"}",
            "actor-1",
            "machine",
            Now.UtcDateTime));

        var entity = await context.EntityChangeLogs.SingleAsync();
        Assert.Equal("tenant-1", entity.TenantId);
        Assert.Equal(7, entity.CompanyId);
        Assert.Equal("hr", context.Model.FindEntityType(typeof(EntityChangeLog))!.GetSchema());
        Assert.Equal("EntityChangeLog", context.Model.FindEntityType(typeof(EntityChangeLog))!.GetTableName());

        var rows = await adapter.GetByEntityAsync("ApplicationUser", 4);
        var row = Assert.Single(rows);
        Assert.Equal(entity.Id, row.Id);
        Assert.False(row.ChangedByUserExists);
    }

    private static ServiceProvider BuildProvider(
        IEntityChangeLogStore store,
        IEntityChangeLogQueryStore queryStore,
        ICurrentExecutionContext actor)
    {
        var services = new ServiceCollection();
        services.AddSingleton(actor);
        services.AddSingleton(store);
        services.AddSingleton(queryStore);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();
        return services.BuildServiceProvider();
    }

    private sealed class RecordingStore : IEntityChangeLogStore, IEntityChangeLogQueryStore
    {
        public List<EntityChangeLogRecord> Added { get; } = [];
        public List<EntityChangeLogQueryRecord> Rows { get; } = [];
        public string? LastEntityName { get; private set; }
        public int? LastEntityId { get; private set; }

        public Task AddAsync(EntityChangeLogRecord record, CancellationToken cancellationToken = default)
        {
            Added.Add(record);
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetAllAsync(
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<EntityChangeLogQueryRecord>>(Rows.ToArray());

        public Task<IReadOnlyList<EntityChangeLogQueryRecord>> GetByEntityAsync(
            string entityName,
            int entityId,
            CancellationToken cancellationToken = default)
        {
            LastEntityName = entityName;
            LastEntityId = entityId;
            return Task.FromResult<IReadOnlyList<EntityChangeLogQueryRecord>>(Rows
                .Where(row => row.EntityId == entityId &&
                              string.Equals(row.EntityName, entityName, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(row => row.ChangedAt)
                .ToArray());
        }
    }

    private sealed record UserSnapshot(
        string Name,
        bool IsDisabled,
        int CompanyId,
        string CreatedById);

    private sealed record TestCurrentActor(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentActor;

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
