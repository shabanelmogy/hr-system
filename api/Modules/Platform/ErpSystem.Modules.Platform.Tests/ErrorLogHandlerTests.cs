using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class ErrorLogHandlerTests
{
    [Fact]
    public async Task Company_reads_fail_closed_before_store_access()
    {
        var store = new Store { HasScope = false };
        var handler = Handler(store, new Actor("user", "tenant", 1, false));
        Assert.Equal("ErrorLogs.Forbidden", (await handler.Handle(new ListErrorLogsQuery(new(), false), default)).Error.Code);
        Assert.Equal("ErrorLogs.Forbidden", (await handler.Handle(new GetErrorLogDetailQuery(Guid.NewGuid(), false), default)).Error.Code);
        Assert.Equal("ErrorLogs.Forbidden", (await handler.Handle(new ExportErrorLogsQuery(new(), false), default)).Error.Code);
        Assert.Equal(3, store.ScopeChecks);
        Assert.Equal(0, store.Reads);
    }

    [Fact]
    public async Task System_scope_never_falls_back_to_company_access()
    {
        var store = new Store { HasScope = true };
        var companyActor = Handler(store, new Actor("user", "tenant", 1, false));
        Assert.Equal("ErrorLogs.Forbidden", (await companyActor.Handle(new ListErrorLogsQuery(new(), true), default)).Error.Code);
        Assert.Equal("ErrorLogs.Forbidden", (await companyActor.Handle(new GetErrorLogSettingsQuery(), default)).Error.Code);
        Assert.Equal("ErrorLogs.Forbidden", (await companyActor.Handle(new UpdateErrorLogSettingsCommand(new(30, 0)), default)).Error.Code);
        var systemActor = Handler(store, new Actor("admin", null, null, true));
        Assert.Equal("ErrorLogs.Forbidden", (await systemActor.Handle(new ListErrorLogsQuery(new(), false), default)).Error.Code);
        Assert.Equal(0, store.Reads);
        Assert.Equal(0, store.ScopeChecks);
    }

    [Fact]
    public async Task Invalid_criteria_and_stale_settings_never_read_or_mutate()
    {
        var store = new Store { SettingsConflict = true };
        var handler = Handler(store, new Actor("admin", null, null, true));
        Assert.Equal("ErrorLogs.Invalid", (await handler.Handle(new ListErrorLogsQuery(new(PageSize: 101), true), default)).Error.Code);
        Assert.Equal("ErrorLogs.Invalid", (await handler.Handle(new ExportErrorLogsQuery(new(Source: "other"), true), default)).Error.Code);
        Assert.Equal("ErrorLogs.Invalid", (await handler.Handle(new UpdateErrorLogSettingsCommand(new(0, 0)), default)).Error.Code);
        Assert.Equal("ErrorLogs.Conflict", (await handler.Handle(new UpdateErrorLogSettingsCommand(new(30, 0)), default)).Error.Code);
        Assert.Equal(0, store.Reads);
        Assert.Equal(1, store.SettingsWrites);
    }

    [Fact]
    public async Task Client_report_uses_trusted_scope_and_does_not_reflect_queue_drop()
    {
        var store = new Store { HasScope = true };
        var sink = new Sink();
        var handler = Handler(store, new Actor("user", "tenant", 7, false), sink);
        var eventId = Guid.NewGuid();
        Assert.True((await handler.Handle(new ReportClientErrorCommand(new("web", "runtime", "TypeError", eventId)), default)).IsSuccess);
        var captured = Assert.Single(sink.Captures);
        Assert.Equal(("user", "tenant", 7), (captured.UserId, captured.TenantId, captured.CompanyId));
        Assert.Equal(ErrorLogSource.Web, captured.Source);
        Assert.Equal(eventId, captured.EventId);
        Assert.Null(captured.IpAddress);
        Assert.Null(captured.MethodFrames);
        Assert.Equal("ErrorLogs.Invalid", (await handler.Handle(new ReportClientErrorCommand(new("web", "runtime", "PrivateException", Guid.NewGuid())), default)).Error.Code);
        Assert.Single(sink.Captures);
        store.HasScope = false;
        Assert.Equal("ErrorLogs.Forbidden", (await handler.Handle(new ReportClientErrorCommand(new("web", "runtime", "Error", Guid.NewGuid())), default)).Error.Code);
        Assert.Single(sink.Captures);
    }

    private static ErrorLogRequestHandler Handler(Store store, Actor actor, Sink? sink = null) =>
        new(store, actor, sink ?? new Sink(), TimeProvider.System, new Localizer());

    private sealed class Actor(string? userId, string? tenantId, int? companyId, bool superAdmin) : ICurrentExecutionContext
    {
        public string? UserId => userId;
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
        public string? CorrelationId => "test-correlation";
        public bool IsInRole(string role) => superAdmin && role == PlatformRoleNames.SuperAdmin;
    }

    private sealed class Sink : IErrorLogCaptureSink
    {
        public List<ErrorLogCapture> Captures { get; } = [];
        public bool TryCapture(ErrorLogCapture capture) { Captures.Add(capture); return false; }
    }

    private sealed class Store : IErrorLogStore
    {
        public bool HasScope { get; set; }
        public bool SettingsConflict { get; set; }
        public int ScopeChecks { get; private set; }
        public int Reads { get; private set; }
        public int SettingsWrites { get; private set; }
        public Task<bool> HasCompanyScopeAsync(string? userId, string? tenantId, int? companyId, CancellationToken token)
        { ScopeChecks++; return Task.FromResult(HasScope); }
        public Task<ErrorLogPage> ListAsync(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId, CancellationToken token)
        { Reads++; return Task.FromResult(new ErrorLogPage([], 0, 1, 25)); }
        public Task<ErrorLogDetail?> DetailAsync(Guid id, bool system, string? tenantId, int? companyId, CancellationToken token)
        { Reads++; return Task.FromResult<ErrorLogDetail?>(null); }
        public Task<ErrorLogExport?> ExportAsync(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId, CancellationToken token)
        { Reads++; return Task.FromResult<ErrorLogExport?>(null); }
        public Task<ErrorLogSettingsResponse> GetSettingsAsync(CancellationToken token)
        { Reads++; return Task.FromResult(new ErrorLogSettingsResponse(90, 0, 0, 0, 0)); }
        public Task<ErrorLogSettingsResponse?> UpdateSettingsAsync(int days, long expectedRevision, string? actorUserId, CancellationToken token)
        { SettingsWrites++; return Task.FromResult<ErrorLogSettingsResponse?>(SettingsConflict ? null : new(days, expectedRevision + 1, 0, 0, 0)); }
    }

    private sealed class Localizer : IStringLocalizer<ErrorLogRequestHandler>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
