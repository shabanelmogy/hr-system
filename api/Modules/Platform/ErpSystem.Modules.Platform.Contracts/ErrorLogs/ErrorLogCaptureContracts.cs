namespace ErpSystem.Modules.Platform.Contracts.ErrorLogs;

public enum ErrorLogSource
{
    Api = 1,
    Job = 2,
    Web = 3,
    Mobile = 4
}

public enum ErrorLogSeverity
{
    Warning = 1,
    Error = 2,
    Critical = 3
}

/// <summary>
/// Safe, bounded diagnostic metadata supplied by trusted host and module adapters.
/// MethodFrames may include structural exception codes and allowlisted HTTP/job context;
/// no raw exception messages, argument values or source paths.
/// Never include an exception, message, stack trace, request path, URL, body or
/// arbitrary client text. Scope values must come from a trusted execution context.
/// </summary>
public sealed record ErrorLogCapture(
    Guid EventId,
    DateTimeOffset OccurredOnUtc,
    ErrorLogSource Source,
    ErrorLogSeverity Severity,
    int? StatusCode,
    string? UserId,
    string? TenantId,
    int? CompanyId,
    string? Service,
    string? Action,
    long? DurationMs,
    string? CorrelationId,
    string? SummaryCode,
    string? Client,
    string? Browser,
    string? IpAddress,
    IReadOnlyList<string>? MethodFrames = null);

/// <summary>
/// Nonblocking capture boundary. Implementations must never throw into the caller.
/// False indicates a dropped record and is not a reason to change its source outcome.
/// </summary>
public interface IErrorLogCaptureSink
{
    bool TryCapture(ErrorLogCapture capture);
}
