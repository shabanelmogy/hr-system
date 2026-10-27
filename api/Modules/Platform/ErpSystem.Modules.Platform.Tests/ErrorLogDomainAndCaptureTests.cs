using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;
using Xunit;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class ErrorLogDomainAndCaptureTests
{
    [Fact]
    public void Rich_diagnostics_are_bounded_and_client_sources_cannot_inject_them()
    {
        var queue = new ErrorLogCaptureQueue();
        var capture = new ErrorLogCapture(Guid.NewGuid(), DateTimeOffset.UtcNow, ErrorLogSource.Api,
            ErrorLogSeverity.Error, 500, "user", "tenant", 1, "Api", "Get", 10, "trace",
            "HttpServerError", "http", "Chrome", "127.0.0.1",
            Enumerable.Repeat("Exception[0].Frame: " + new string('N', 500), 200).ToArray());
        Assert.True(queue.TryCapture(capture));
        Assert.True(queue.Reader.TryRead(out var entry));
        Assert.True(entry!.MethodFramesJson!.Length <= 32768);
        Assert.True(entry.MethodFramesJson.Length > 4096);
        Assert.Contains("TenantId: tenant", entry.MethodFramesJson);
        Assert.Contains("DiagnosticsTruncated: StorageBudget", entry.MethodFramesJson);
        Assert.Contains(new string('N', 490), entry.MethodFramesJson);
        Assert.True(queue.TryCapture(capture with { Source = ErrorLogSource.Web, EventId = Guid.NewGuid() }));
        Assert.True(queue.Reader.TryRead(out var client));
        Assert.Null(client!.MethodFramesJson);
        Assert.True(queue.TryCapture(capture with { MethodFrames = Enumerable.Repeat(new string('+', 600), 200).ToArray() }));
        Assert.True(queue.Reader.TryRead(out var escaped));
        Assert.InRange(escaped!.MethodFramesJson!.Length, 4097, 32768);
    }

    [Fact]
    public void Retention_enforces_range_revision_and_noop()
    {
        var settings = ErrorLogRetentionSettings.CreateDefault();
        Assert.Equal(90, settings.RetentionDays);
        Assert.Equal(0, settings.Revision);
        Assert.False(settings.Change(90, 0));
        Assert.True(settings.Change(3650, 0));
        Assert.Equal(1, settings.Revision);
        Assert.Throws<InvalidOperationException>(() => settings.Change(1, 0));
        Assert.Throws<ArgumentOutOfRangeException>(() => settings.Change(0, 1));
    }

    [Fact]
    public void Entry_rejects_bad_classification_and_untrusted_company_pair()
    {
        static ErrorLogEntry Create(string source, string? tenant, int? company) =>
            ErrorLogEntry.Create(Guid.NewGuid(), DateTime.UtcNow, source, "error", tenant, company,
                null, null, null, null, null, null, "Error", null, null, null, null);
        Assert.Throws<ArgumentException>(() => Create("other", null, null));
        Assert.Throws<ArgumentException>(() => Create("api", null, 2));
        Assert.Equal("api", Create("api", "tenant", 2).Source);
    }

    [Fact]
    public void Client_event_dedup_is_scoped_and_never_exposes_raw_metadata()
    {
        var queue = new ErrorLogCaptureQueue();
        var eventId = Guid.NewGuid();
        var input = new ErrorLogCapture(eventId, DateTimeOffset.UtcNow, ErrorLogSource.Web,
            ErrorLogSeverity.Error, null, "user", "tenant", 1, "runtime", "TypeError",
            null, "corr", "ClientError", "raw message!", null, null);
        Assert.True(queue.TryCapture(input));
        Assert.True(queue.TryCapture(input));
        Assert.Equal(1, queue.Depth);
        Assert.True(queue.TryCapture(input with { CompanyId = 2 }));
        Assert.Equal(2, queue.Depth);
        Assert.True(queue.Reader.TryRead(out var first));
        Assert.Null(first.Client);
        Assert.NotEqual(eventId, first.Id);
    }

    [Fact]
    public void Full_queue_drops_without_blocking_and_rejected_client_event_can_retry()
    {
        var queue = new ErrorLogCaptureQueue();
        var now = DateTimeOffset.UtcNow;
        for (var i = 0; i < 1024; i++)
            Assert.True(queue.TryCapture(new ErrorLogCapture(Guid.NewGuid(), now, ErrorLogSource.Api,
                ErrorLogSeverity.Error, 500, null, null, null, "Api", "Get", null, null,
                "HttpServerError", null, null, null)));
        Assert.Equal(1024, queue.Depth);

        var client = new ErrorLogCapture(Guid.NewGuid(), now, ErrorLogSource.Web,
            ErrorLogSeverity.Error, null, "user", "tenant", 1, "runtime", "Error", null,
            "correlation", "ClientError", null, null, null);
        Assert.False(queue.TryCapture(client));
        Assert.Equal(1, queue.Dropped);
        Assert.Equal(1024, queue.Depth);

        Assert.True(queue.Reader.TryRead(out _));
        queue.Consumed();
        Assert.True(queue.TryCapture(client));
        Assert.True(queue.TryCapture(client));
        Assert.Equal(1024, queue.Depth);
        Assert.Equal(1, queue.Dropped);
    }
}
