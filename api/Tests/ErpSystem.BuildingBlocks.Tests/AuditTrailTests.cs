using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Domain.Auditing;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.BuildingBlocks.Persistence.AuditTrail;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class AuditTrailTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task Create_RecordsOneCreatedEntryWithTheGeneratedKeyAndActor()
    {
        await using var context = CreateContext(out _);
        var widget = new Widget { Name = "Pump", Code = "P-1", TenantId = "tenant-1", CompanyId = 7 };
        context.Widgets.Add(widget);

        await context.SaveChangesAsync();

        var entry = Assert.Single(await EntriesAsync(context));
        Assert.Equal(AuditAction.Created, entry.Action);
        Assert.Equal(nameof(Widget), entry.EntityName);
        Assert.Equal(widget.Id.ToString(System.Globalization.CultureInfo.InvariantCulture), entry.EntityKey);
        Assert.Equal("Pump", entry.EntityDisplay);
        Assert.Equal(("tenant-1", 7, "user-1", "corr-1"), (entry.TenantId, entry.CompanyId, entry.UserId, entry.CorrelationId));
        var changes = Changes(entry);
        Assert.Contains(changes, change => change is { Field: "Name", OldValue: null, NewValue: "Pump" });
        Assert.Contains(changes, change => change is { Field: "Code", NewValue: "P-1" });
    }

    [Fact]
    public async Task Update_RecordsOnlyChangedBusinessFields()
    {
        await using var context = CreateContext(out _);
        var widget = new Widget { Name = "Pump", Code = "P-1", TenantId = "tenant-1", CompanyId = 7 };
        context.Widgets.Add(widget);
        await context.SaveChangesAsync();

        widget.Name = "Valve";
        widget.UpdatedOn = DateTime.UtcNow;
        await context.SaveChangesAsync();

        var entry = (await EntriesAsync(context)).Last();
        Assert.Equal(AuditAction.Modified, entry.Action);
        var change = Assert.Single(Changes(entry));
        Assert.Equal(new AuditFieldChange("Name", "Pump", "Valve"), change);
        Assert.Equal(1, entry.ChangeCount);
    }

    [Fact]
    public async Task Update_WithOnlyBookkeepingChanges_RecordsNothing()
    {
        await using var context = CreateContext(out _);
        var widget = new Widget { Name = "Pump", TenantId = "tenant-1", CompanyId = 7 };
        context.Widgets.Add(widget);
        await context.SaveChangesAsync();

        widget.UpdatedOn = DateTime.UtcNow;
        widget.UpdatedById = "user-1";
        await context.SaveChangesAsync();

        Assert.Single(await EntriesAsync(context));
    }

    [Fact]
    public async Task SoftDeleteAndRestore_AreRecordedAsDeletedAndRestored()
    {
        await using var context = CreateContext(out _);
        var widget = new Widget { Name = "Pump", TenantId = "tenant-1", CompanyId = 7 };
        context.Widgets.Add(widget);
        await context.SaveChangesAsync();

        widget.IsDeleted = true;
        await context.SaveChangesAsync();
        widget.IsDeleted = false;
        await context.SaveChangesAsync();

        var entries = await EntriesAsync(context);
        Assert.Equal(
            [AuditAction.Created, AuditAction.Deleted, AuditAction.Restored],
            entries.Select(entry => entry.Action));
        Assert.Contains(Changes(entries[1]), change => change is { Field: "Name", OldValue: "Pump", NewValue: null });
    }

    [Fact]
    public async Task HardDelete_RecordsTheLastValues()
    {
        await using var context = CreateContext(out _);
        var widget = new Widget { Name = "Pump", TenantId = "tenant-1", CompanyId = 7 };
        context.Widgets.Add(widget);
        await context.SaveChangesAsync();

        context.Widgets.Remove(widget);
        await context.SaveChangesAsync();

        var entry = (await EntriesAsync(context)).Last();
        Assert.Equal(AuditAction.Deleted, entry.Action);
        Assert.Contains(Changes(entry), change => change is { Field: "Name", OldValue: "Pump" });
    }

    [Fact]
    public async Task SensitiveIgnoredAndScopeFields_AreNeverCopied()
    {
        await using var context = CreateContext(out _);
        context.Widgets.Add(new Widget
        {
            Name = "Pump",
            TenantId = "tenant-1",
            CompanyId = 7,
            ApiSecret = "s3cr3t",
            PasswordHash = "hash",
            Internal = "hidden"
        });
        context.Noise.Add(new NoiseRow { Value = "raw" });

        await context.SaveChangesAsync();

        var entry = Assert.Single(await EntriesAsync(context));
        var fields = Changes(entry).Select(change => change.Field).ToArray();
        Assert.DoesNotContain("ApiSecret", fields);
        Assert.DoesNotContain("PasswordHash", fields);
        Assert.DoesNotContain("Internal", fields);
        Assert.DoesNotContain("TenantId", fields);
        Assert.DoesNotContain("CreatedOn", fields);
        Assert.DoesNotContain("Id", fields);
    }

    [Fact]
    public async Task Source_PagesNewestFirstWithAKeysetCursorAndRespectsCompanyScope()
    {
        await using var context = CreateContext(out var clock);
        for (var index = 1; index <= 3; index++)
        {
            clock.Advance(TimeSpan.FromMinutes(1));
            context.Widgets.Add(new Widget { Name = $"W{index}", TenantId = "tenant-1", CompanyId = 7 });
            await context.SaveChangesAsync();
        }

        clock.Advance(TimeSpan.FromMinutes(1));
        context.Widgets.Add(new Widget { Name = "Other company", TenantId = "tenant-1", CompanyId = 8 });
        await context.SaveChangesAsync();

        var source = new AuditTrailSource<TestDbContext>(context, "test");
        var first = await source.ListAsync(Filter(after: null, take: 2));
        Assert.Equal(["W3", "W2"], first.Select(record => record.EntityDisplay ?? string.Empty));

        var cursor = new AuditTrailCursor(first[^1].OccurredOnUtc, first[^1].ModuleCode, first[^1].Id);
        var second = await source.ListAsync(Filter(cursor, take: 2));
        Assert.Equal(["W1"], second.Select(record => record.EntityDisplay ?? string.Empty));

        var details = await source.GetAsync(first[0].Id, "tenant-1", 7);
        Assert.NotNull(details);
        Assert.Contains(details.Changes, change => change.Field == "Name" && change.NewValue == "W3");
        Assert.Null(await source.GetAsync(first[0].Id, "tenant-2", 7));
    }

    private static AuditTrailFilter Filter(AuditTrailCursor? after, int take) =>
        new("tenant-1", 7, null, null, null, null, null, null, after, take);

    private static TestDbContext CreateContext(out ManualClock clock)
    {
        clock = new ManualClock(new DateTimeOffset(2026, 1, 1, 8, 0, 0, TimeSpan.Zero));
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .AddInterceptors(new AuditTrailSaveChangesInterceptor(
                "test",
                new TestExecutionContext(),
                clock))
            .Options;
        return new TestDbContext(options);
    }

    private static Task<List<AuditTrailEntry>> EntriesAsync(TestDbContext context) =>
        context.Set<AuditTrailEntry>().AsNoTracking().OrderBy(entry => entry.Id).ToListAsync();

    private static List<AuditFieldChange> Changes(AuditTrailEntry entry) =>
        JsonSerializer.Deserialize<List<AuditFieldChange>>(entry.ChangesJson, JsonOptions) ?? [];

    public sealed class TestDbContext(DbContextOptions<TestDbContext> options) : DbContext(options)
    {
        public DbSet<Widget> Widgets => Set<Widget>();
        public DbSet<NoiseRow> Noise => Set<NoiseRow>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyAuditTrail();
        }
    }

    public sealed class Widget : CompanyAuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? ApiSecret { get; set; }
        public string? PasswordHash { get; set; }

        [AuditIgnore]
        public string? Internal { get; set; }
    }

    [AuditIgnore]
    public sealed class NoiseRow : AuditableEntity
    {
        public int Id { get; set; }
        public string Value { get; set; } = string.Empty;
    }

    private sealed class TestExecutionContext : ICurrentExecutionContext
    {
        public string? UserId => "user-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 7;
        public string? CorrelationId => "corr-1";
    }

    private sealed class ManualClock(DateTimeOffset now) : TimeProvider
    {
        private DateTimeOffset _now = now;

        public void Advance(TimeSpan by) => _now += by;

        public override DateTimeOffset GetUtcNow() => _now;
    }
}
