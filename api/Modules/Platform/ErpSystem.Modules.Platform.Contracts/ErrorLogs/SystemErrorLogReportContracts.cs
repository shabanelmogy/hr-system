namespace ErpSystem.Modules.Platform.Contracts.ErrorLogs;

/// <summary>Global summary criteria. The consuming report policy must also authorize the source grant.</summary>
public sealed record SystemErrorLogReportCriteria(
    DateTime? FromUtc = null,
    DateTime? ToUtc = null,
    string? UserName = null,
    string? Source = null,
    int? StatusCode = null,
    string? Search = null,
    string? ColumnFilters = null);

/// <summary>Approved report projection; deliberately excludes diagnostic payloads and scope identifiers.</summary>
public sealed record SystemErrorLogReportRow(
    Guid Id,
    DateTime OccurredOnUtc,
    string Source,
    string Severity,
    string? UserName,
    string? Service,
    string? Action,
    int? StatusCode,
    long? DurationMs,
    string? CorrelationId,
    string Summary,
    string? Client,
    string? Browser);

public enum SystemErrorLogReportFailure
{
    None,
    Forbidden,
    Invalid,
    TooLarge
}

public sealed record SystemErrorLogReportResult(
    IReadOnlyList<SystemErrorLogReportRow> Rows,
    SystemErrorLogReportFailure Failure);

/// <summary>
/// Owner-authorized, bounded global summaries. Consumers must independently enforce
/// SystemErrorLogs:View and their report action grants before calling this source.
/// </summary>
public interface ISystemErrorLogReportSource
{
    const int MaximumRows = 5000;

    Task<SystemErrorLogReportResult> ReadAsync(SystemErrorLogReportCriteria criteria, CancellationToken token);
}
