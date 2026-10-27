using System.Collections.Concurrent;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Channels;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;

public sealed class ErrorLogCaptureQueue : IErrorLogCaptureSink
{
    private readonly Channel<ErrorLogEntry> _channel = Channel.CreateBounded<ErrorLogEntry>(
        new BoundedChannelOptions(1024) { FullMode = BoundedChannelFullMode.Wait, SingleReader = true });
    private readonly ConcurrentDictionary<string, DateTimeOffset> _recent = new(StringComparer.Ordinal);
    private readonly object _dedupGate = new();
    private long _dropped;
    private long _failedWrites;
    private int _depth;

    public int Depth => Volatile.Read(ref _depth);
    public long Dropped => Interlocked.Read(ref _dropped);
    public long FailedWrites => Interlocked.Read(ref _failedWrites);
    internal ChannelReader<ErrorLogEntry> Reader => _channel.Reader;

    public bool TryCapture(ErrorLogCapture capture)
    {
        try
        {
            if (capture.EventId == Guid.Empty || capture.Source is < ErrorLogSource.Api or > ErrorLogSource.Mobile)
                return Drop();
            var clientSource = capture.Source is ErrorLogSource.Web or ErrorLogSource.Mobile;
            var idempotencyKey = $"{capture.Source}:{capture.TenantId}:{capture.CompanyId}:{capture.UserId}:{capture.EventId}";
            var now = DateTimeOffset.UtcNow;
            lock (_dedupGate)
            {
                if (clientSource && _recent.TryGetValue(idempotencyKey, out var expiry) && expiry > now)
                    return true;
                if (clientSource && _recent.Count >= 8192)
                {
                    foreach (var pair in _recent.Where(x => x.Value <= now).Take(2048)) _recent.TryRemove(pair.Key, out _);
                    if (_recent.Count >= 8192) return Drop();
                }
            }
            var source = capture.Source.ToString().ToLowerInvariant();
            var severity = capture.Severity == ErrorLogSeverity.Warning ? "warning" : "error";
            var trustedLines = new List<string>();
            if (!clientSource)
            {
                if (capture.TenantId is { } tenant) trustedLines.Add($"TenantId: {tenant}");
                if (capture.CompanyId is { } company) trustedLines.Add($"CompanyId: {company}");
                if (capture.UserId is { } user) trustedLines.Add($"UserId: {user}");
                if (capture.MethodFrames is { } supplied) trustedLines.AddRange(supplied);
            }
            var frames = clientSource ? null : DiagnosticLines(trustedLines);
            var entryId = clientSource ? new Guid(SHA256.HashData(Encoding.UTF8.GetBytes(idempotencyKey)).AsSpan(0, 16)) : Guid.NewGuid();
            var entry = ErrorLogEntry.Create(entryId, capture.OccurredOnUtc.UtcDateTime,
                source, severity, Safe(capture.TenantId, 32), capture.CompanyId,
                Safe(capture.UserId, 450), Safe(capture.Service, 128), Safe(capture.Action, 128),
                capture.StatusCode is >= 400 and <= 599 ? capture.StatusCode : null,
                capture.DurationMs is >= 0 and <= 86400000 ? capture.DurationMs : null,
                Safe(capture.CorrelationId, 128), SafeSummary(capture.SummaryCode),
                SafeClient(capture.Client), SafeBrowser(capture.Browser), SafeIp(capture.IpAddress),
                frames is { Length: > 0 } ? JsonSerializer.Serialize(frames) : null);
            lock (_dedupGate)
            {
                if (clientSource && _recent.TryGetValue(idempotencyKey, out var expiry) && expiry > now)
                    return true;
                if (clientSource && _recent.Count >= 8192) return Drop();
                Interlocked.Increment(ref _depth);
                if (!_channel.Writer.TryWrite(entry))
                {
                    Interlocked.Decrement(ref _depth);
                    return Drop();
                }
                if (clientSource) _recent[idempotencyKey] = now.AddMinutes(10);
            }
            return true;
        }
        catch
        {
            return Drop();
        }
    }

    internal void Consumed() => Interlocked.Decrement(ref _depth);
    internal void FailedWrite() => Interlocked.Increment(ref _failedWrites);
    private bool Drop() { Interlocked.Increment(ref _dropped); return false; }

    private static string[]? DiagnosticLines(IReadOnlyList<string>? values)
    {
        if (values is null) return null;
        var lines = new List<string>();
        var jsonLength = 2;
        var truncated = false;
        foreach (var value in values)
        {
            if (string.IsNullOrWhiteSpace(value)) continue;
            var line = new string(value.Take(512).Select(c => char.IsAsciiLetterOrDigit(c) ||
                c is '_' or '-' or '.' or ':' or '+' or '/' or '{' or '}' or '[' or ']' or '(' or ')' or '`' or ',' or ' ' ? c : '_').ToArray());
            // Account for encoder escaping (for example +), and reserve room for the marker.
            var cost = JsonSerializer.Serialize(line).Length + (lines.Count > 0 ? 1 : 0);
            if (lines.Count >= 127 || jsonLength + cost > 32768 - 64)
            {
                truncated = true;
                break;
            }
            truncated |= value.Length > 512;
            lines.Add(line);
            jsonLength += cost;
        }
        if (truncated) lines.Add("DiagnosticsTruncated: StorageBudget");
        return lines.ToArray();
    }

    private static string? Safe(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var chars = value.Take(max).Select(c => char.IsAsciiLetterOrDigit(c) || c is '_' or '-' or '.' or ':' or '+' ? c : '_').ToArray();
        return new string(chars);
    }
    private static string? SafeIp(string? value) => IPAddress.TryParse(value, out var ip) ? ip.ToString() : null;
    private static string SafeSummary(string? value) => value is "HttpClientError" or "HttpServerError" or "JobAttemptFailed" or "ClientError" ? value : "Error";
    private static string? SafeClient(string? value) => value is "http" or "web" or "mobile" ? value : null;
    private static string? SafeBrowser(string? value) => value is "Edge" or "Chrome" or "Firefox" or "Safari" or "Other" ? value : null;
}

public sealed class ErrorLogCaptureWorker(
    ErrorLogCaptureQueue queue, IServiceScopeFactory scopes, TimeProvider clock,
    ILogger<ErrorLogCaptureWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) =>
        await Task.WhenAll(PersistAsync(stoppingToken), CleanupAsync(stoppingToken));

    private async Task PersistAsync(CancellationToken token)
    {
        await foreach (var entry in queue.Reader.ReadAllAsync(token))
        {
            queue.Consumed();
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
                if (entry.Source is "web" or "mobile" && await db.ErrorLogEntries.AsNoTracking().AnyAsync(x => x.Id == entry.Id, token))
                    continue;
                db.ErrorLogEntries.Add(entry);
                await db.SaveChangesAsync(token);
            }
            catch (OperationCanceledException) when (token.IsCancellationRequested) { return; }
            catch (Exception exception)
            {
                queue.FailedWrite();
                logger.LogWarning("Error log sink write failed. Kind: {Kind}", exception.GetType().Name);
            }
        }
    }

    private async Task CleanupAsync(CancellationToken token)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1), clock);
        try
        {
            do
            {
                try
                {
                    await using var scope = scopes.CreateAsyncScope();
                    var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
                    await ErrorLogCleanup.DeleteExpiredAsync(db, clock, token);
                }
                catch (Exception exception) when (!token.IsCancellationRequested)
                {
                    logger.LogWarning("Error log cleanup failed. Kind: {Kind}", exception.GetType().Name);
                }
            } while (await timer.WaitForNextTickAsync(token));
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested) { }
    }
}

public static class ErrorLogCleanup
{
    public static async Task<int> DeleteExpiredAsync(PlatformDbContext db, TimeProvider clock, CancellationToken token)
    {
        var days = await db.ErrorLogRetentionSettings.AsNoTracking().Select(x => (int?)x.RetentionDays).SingleOrDefaultAsync(token) ?? 90;
        var cutoff = clock.GetUtcNow().UtcDateTime.AddDays(-days);
        var removed = 0;
        for (var batch = 0; batch < 10; batch++)
        {
            var ids = await db.ErrorLogEntries.AsNoTracking().Where(x => x.OccurredOnUtc < cutoff)
                .OrderBy(x => x.OccurredOnUtc).ThenBy(x => x.Id).Select(x => x.Id).Take(500).ToArrayAsync(token);
            if (ids.Length == 0) break;
            removed += await db.ErrorLogEntries.Where(x => ids.Contains(x.Id)).ExecuteDeleteAsync(token);
            if (ids.Length < 500) break;
        }
        return removed;
    }
}
