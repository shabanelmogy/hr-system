using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class SystemErrorLogReportSourceTests
{
    private static readonly DateTime Now = new(2026, 11, 6, 12, 0, 0, DateTimeKind.Utc);

    [Theory]
    [InlineData(null, true)]
    [InlineData("", true)]
    [InlineData("tenant-user", false)]
    public async Task Untrusted_or_tenant_actor_is_denied_before_any_read(string? userId, bool superAdmin)
    {
        var store = new TrackingStore();
        var result = await new SystemErrorLogReportSource(store, new Actor(userId, superAdmin))
            .ReadAsync(new(), default);

        Assert.Equal(SystemErrorLogReportFailure.Forbidden, result.Failure);
        Assert.Empty(result.Rows);
        Assert.Equal(0, store.Reads);
    }

    [Theory]
    [InlineData("unknown", null)]
    [InlineData("api", "[{\"field\":\"diagnostics\",\"operator\":\"and\",\"constraints\":[] }]")]
    public async Task Invalid_source_or_column_filters_are_rejected_before_read(string source, string? columnFilters)
    {
        var store = new TrackingStore();
        var result = await Source(store).ReadAsync(new(Source: source, ColumnFilters: columnFilters), default);

        Assert.Equal(SystemErrorLogReportFailure.Invalid, result.Failure);
        Assert.Equal(0, store.Reads);
    }

    [Fact]
    public async Task Invalid_dates_status_and_text_use_the_existing_owner_validation()
    {
        var store = new TrackingStore();
        var source = Source(store);
        SystemErrorLogReportCriteria[] invalid =
        [
            new(FromUtc: Now, ToUtc: Now.AddDays(-1)),
            new(FromUtc: DateTime.SpecifyKind(Now, DateTimeKind.Unspecified)),
            new(StatusCode: 200),
            new(Search: new string('x', 121)),
            new(UserName: new string('x', 101))
        ];
        foreach (var criteria in invalid)
            Assert.Equal(SystemErrorLogReportFailure.Invalid, (await source.ReadAsync(criteria, default)).Failure);
        Assert.Equal(0, store.Reads);
    }

    [Fact]
    public async Task Report_query_applies_the_same_global_filters_and_only_returns_safe_summary_fields()
    {
        await using var db = CreateDb();
        db.Users.Add(new PlatformApplicationUser { Id = "actor-private", UserName = "operator" });
        var target = Entry("tenant-private", "TargetSummary");
        db.ErrorLogEntries.AddRange(target, Entry("other-private", "OtherSummary"));
        await db.SaveChangesAsync();
        const string columns = """[{"field":"statusCode","operator":"and","constraints":[{"matchMode":"gte","value":500}]}]""";
        var result = await Source(Store(db)).ReadAsync(new(Now.AddDays(-1), Now.AddDays(1), "oper", "api", 500, "Target", columns), default);

        Assert.Equal(SystemErrorLogReportFailure.None, result.Failure);
        var row = Assert.Single(result.Rows);
        Assert.Equal(target.Id, row.Id);
        Assert.Equal("operator", row.UserName);
        Assert.Equal("TargetSummary", row.Summary);
        Assert.Equal(DateTimeKind.Utc, row.OccurredOnUtc.Kind);
        Assert.Equal(5_000_000_000L, row.DurationMs);
        var serialized = JsonSerializer.Serialize(result);
        Assert.DoesNotContain("127.0.0.1", serialized, StringComparison.Ordinal);
        Assert.DoesNotContain("Erp.PrivateMethod", serialized, StringComparison.Ordinal);
        Assert.DoesNotContain("tenant-private", serialized, StringComparison.Ordinal);
        Assert.DoesNotContain("actor-private", serialized, StringComparison.Ordinal);
    }

    [Fact]
    public async Task More_than_5000_matches_fail_without_partial_rows_but_filtered_subset_succeeds()
    {
        await using var db = CreateDb();
        db.ErrorLogEntries.AddRange(Enumerable.Range(0, 5000).Select(_ => Entry("tenant-private", "OtherSummary")));
        db.ErrorLogEntries.Add(Entry("tenant-private", "TargetSummary"));
        await db.SaveChangesAsync();
        var source = Source(Store(db));

        var tooLarge = await source.ReadAsync(new(), default);
        Assert.Equal(SystemErrorLogReportFailure.TooLarge, tooLarge.Failure);
        Assert.Empty(tooLarge.Rows);
        var bounded = await source.ReadAsync(new(Search: "OtherSummary"), default);
        Assert.Equal(SystemErrorLogReportFailure.None, bounded.Failure);
        Assert.Equal(5000, bounded.Rows.Count);
        Assert.Single((await source.ReadAsync(new(Search: "TargetSummary"), default)).Rows);
    }

    [Fact]
    public async Task Cancellation_is_forwarded_and_empty_result_is_success()
    {
        var store = new TrackingStore();
        using var cancellation = new CancellationTokenSource();
        var result = await Source(store).ReadAsync(new(), cancellation.Token);

        Assert.Equal(SystemErrorLogReportFailure.None, result.Failure);
        Assert.Empty(result.Rows);
        Assert.Equal(cancellation.Token, store.Token);
    }

    private static SystemErrorLogReportSource Source(IErrorLogReportReadStore store) => new(store, new Actor("super-admin", true));
    private static ErrorLogStore Store(PlatformDbContext db) => new(db, new ErrorLogCaptureQueue(), TimeProvider.System);
    private static PlatformDbContext CreateDb() => new(new DbContextOptionsBuilder<PlatformDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private static ErrorLogEntry Entry(string tenant, string summary) => ErrorLogEntry.Create(Guid.NewGuid(), Now,
        "api", "error", tenant, 9, "actor-private", "OrdersController", "Get", 500, 5_000_000_000L,
        "correlation", summary, "http", "Chrome", "127.0.0.1", "[\"Erp.PrivateMethod\"]");

    private sealed class Actor(string? userId, bool superAdmin) : ICurrentExecutionContext
    {
        public string? UserId => userId;
        public string? TenantId => null;
        public int? CompanyId => null;
        public string? CorrelationId => "report-test";
        public bool IsInRole(string role) => superAdmin && role == "super_admin";
    }

    private sealed class TrackingStore : IErrorLogReportReadStore
    {
        public int Reads { get; private set; }
        public CancellationToken Token { get; private set; }
        public Task<IReadOnlyList<SystemErrorLogReportRow>?> ReadReportAsync(ErrorLogCriteria criteria, CancellationToken token)
        {
            Reads++;
            Token = token;
            return Task.FromResult<IReadOnlyList<SystemErrorLogReportRow>?>([]);
        }
    }
}
