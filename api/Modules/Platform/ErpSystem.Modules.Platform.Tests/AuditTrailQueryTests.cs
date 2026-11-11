using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Features.Platform.AuditTrail;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class AuditTrailQueryTests
{
    private static readonly DateTime Start = new(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task Column_filters_are_validated_and_resolved_by_owner_before_module_reads()
    {
        var source = new FakeSource("hr", Record("hr", 1, 1));
        var handler = new GetAuditTrailQueryHandler([source], new FakeUsers(), new TestContext("tenant-1", 7));
        const string rules = """[{"field":"userName","operator":"and","constraints":[{"matchMode":"contains","value":"Ahmed"}]}]""";
        var result = await handler.Handle(new(new AuditTrailQueryRequest { ColumnFilters = rules }), default);
        Assert.True(result.IsSuccess);
        Assert.Equal("userName", Assert.Single(source.LastFilter!.ColumnFilters!).Field);
        Assert.Equal("user-1", Assert.Single(source.LastFilter.MatchingUserIds!));
        var invalid = await handler.Handle(new(new AuditTrailQueryRequest { ColumnFilters = "[] garbage" }), default);
        Assert.True(invalid.IsFailure);
        Assert.Equal("AuditTrail.InvalidFilters", invalid.Error.Code);
    }

    [Fact]
    public async Task Page_MergesModulesNewestFirstAndResolvesUserNames()
    {
        var hr = new FakeSource("hr", Record("hr", 1, 1), Record("hr", 2, 3));
        var acc = new FakeSource("acc", Record("acc", 10, 2), Record("acc", 11, 4));
        var handler = new GetAuditTrailQueryHandler(
            [hr, acc],
            new FakeUsers(),
            new TestContext("tenant-1", 7));

        var page = await handler.Handle(
            new GetAuditTrailQuery(new AuditTrailQueryRequest { PageSize = 3 }),
            CancellationToken.None);

        Assert.True(page.IsSuccess);
        Assert.Equal([11L, 2L, 10L], page.Value.Items.Select(item => item.Id));
        Assert.All(page.Value.Items, item => Assert.Equal("Ahmed Ali", item.UserName));
        Assert.NotNull(page.Value.NextCursor);
        Assert.Equal(("tenant-1", 7), (hr.LastFilter!.TenantId, hr.LastFilter.CompanyId));
        Assert.Equal(4, hr.LastFilter.Take);
        Assert.Null(page.Value.TotalCount);
        Assert.Equal(0, hr.CountCalls);
        Assert.Equal(0, acc.CountCalls);
    }

    [Fact]
    public async Task Page_counts_selected_modules_with_the_same_scope_and_filters_without_cursor()
    {
        var hr = new FakeSource("hr", Record("hr", 1, 1), Record("hr", 2, 3));
        var acc = new FakeSource("acc", Record("acc", 10, 2));
        var handler = new GetAuditTrailQueryHandler([hr, acc], new FakeUsers(), new TestContext("tenant-1", 7));
        var request = new AuditTrailQueryRequest
        {
            IncludeTotalCount = true,
            ModuleCode = "hr",
            EntityName = "Department",
            UserId = "user-1",
            PageSize = 1,
            Cursor = AuditTrailCursorCodec.Encode(Record("hr", 2, 3))
        };
        var page = await handler.Handle(new(request), default);
        Assert.True(page.IsSuccess);
        Assert.Equal(2L, page.Value.TotalCount);
        Assert.Single(page.Value.Items);
        Assert.Equal(1, hr.CountCalls);
        Assert.Equal(0, acc.CountCalls);
        Assert.NotNull(hr.LastFilter!.After);
        Assert.Equal(hr.LastFilter with { After = null }, hr.LastCountFilter);

        var all = await handler.Handle(new(request with { ModuleCode = null, Cursor = null }), default);
        Assert.Equal(3L, all.Value.TotalCount);
        var empty = await handler.Handle(new(request with { ModuleCode = "missing", Cursor = null }), default);
        Assert.Equal(0L, empty.Value.TotalCount);
        Assert.Empty(empty.Value.Items);
        Assert.Null(empty.Value.NextCursor);
    }

    [Fact]
    public async Task Page_WithoutCompanyContext_IsForbidden()
    {
        var handler = new GetAuditTrailQueryHandler(
            [new FakeSource("hr")],
            new FakeUsers(),
            new TestContext("tenant-1", null));

        var page = await handler.Handle(
            new GetAuditTrailQuery(new AuditTrailQueryRequest()),
            CancellationToken.None);

        Assert.True(page.IsFailure);
        Assert.Equal("AuditTrail.MissingCompany", page.Error.Code);
    }

    [Fact]
    public void Cursor_RoundTripsAndRejectsGarbage()
    {
        var record = Record("reference-data", 42, 5);

        var cursor = AuditTrailCursorCodec.Decode(AuditTrailCursorCodec.Encode(record));

        Assert.Equal(new AuditTrailCursor(record.OccurredOnUtc, "reference-data", 42), cursor);
        Assert.Null(AuditTrailCursorCodec.Decode("not a cursor"));
    }

    private static AuditTrailRecord Record(string module, long id, int minute) => new(
        module, id, "tenant-1", 7, "Department", id.ToString(System.Globalization.CultureInfo.InvariantCulture),
        $"Item {id}", AuditAction.Modified, "user-1", Start.AddMinutes(minute), null, 1);

    private sealed class FakeSource(string moduleCode, params AuditTrailRecord[] records) : IAuditTrailSource
    {
        public string ModuleCode { get; } = moduleCode;
        public AuditTrailFilter? LastFilter { get; private set; }
        public AuditTrailFilter? LastCountFilter { get; private set; }
        public int CountCalls { get; private set; }

        public Task<long> CountAsync(AuditTrailFilter filter, CancellationToken cancellationToken = default)
        {
            CountCalls++;
            LastCountFilter = filter;
            return Task.FromResult(records.LongLength);
        }

        public Task<IReadOnlyList<AuditTrailRecord>> ListAsync(
            AuditTrailFilter filter,
            CancellationToken cancellationToken = default)
        {
            LastFilter = filter;
            IReadOnlyList<AuditTrailRecord> result = records
                .OrderByDescending(record => record.OccurredOnUtc)
                .Take(filter.Take)
                .ToArray();
            return Task.FromResult(result);
        }

        public Task<AuditTrailRecordDetails?> GetAsync(
            long id,
            string? tenantId,
            int? companyId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<AuditTrailRecordDetails?>(null);

        public Task<IReadOnlyList<string>> ListEntityNamesAsync(
            string? tenantId,
            int? companyId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<string>>([]);
    }

    private sealed class FakeUsers : IAuditTrailUserDirectory
    {
        public Task<IReadOnlyCollection<string>> GetMatchingIdsAsync(
            IReadOnlyList<ErpSystem.BuildingBlocks.Application.Filtering.ColumnFilterGroup> filters,
            CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<string>>(["user-1"]);
        public Task<IReadOnlyDictionary<string, string>> GetDisplayNamesAsync(
            IReadOnlyCollection<string> userIds,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyDictionary<string, string>>(
                userIds.ToDictionary(id => id, _ => "Ahmed Ali"));
    }

    private sealed class TestContext(string? tenantId, int? companyId) : ICurrentExecutionContext
    {
        public string? UserId => "viewer";
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
        public bool IsInRole(string role) => false;
    }
}
