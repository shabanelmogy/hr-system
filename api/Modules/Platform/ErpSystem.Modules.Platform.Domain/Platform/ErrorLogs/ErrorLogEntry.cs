namespace ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;

public sealed class ErrorLogEntry
{
    private ErrorLogEntry() { }

    public Guid Id { get; private set; }
    public DateTime OccurredOnUtc { get; private set; }
    public string Source { get; private set; } = string.Empty;
    public string Severity { get; private set; } = string.Empty;
    public string? TenantId { get; private set; }
    public int? CompanyId { get; private set; }
    public string? UserId { get; private set; }
    public string? Service { get; private set; }
    public string? Action { get; private set; }
    public int? StatusCode { get; private set; }
    public long? DurationMs { get; private set; }
    public string? CorrelationId { get; private set; }
    public string Summary { get; private set; } = string.Empty;
    public string? Client { get; private set; }
    public string? Browser { get; private set; }
    public string? IpAddress { get; private set; }
    public string? MethodFramesJson { get; private set; }

    public static ErrorLogEntry Create(Guid id, DateTime occurredOnUtc, string source, string severity,
        string? tenantId, int? companyId, string? userId, string? service, string? action,
        int? statusCode, long? durationMs, string? correlationId, string summary,
        string? client, string? browser, string? ipAddress, string? methodFramesJson)
    {
        if (id == Guid.Empty || occurredOnUtc.Kind != DateTimeKind.Utc)
            throw new ArgumentException("A nonempty ID and UTC occurrence are required.");
        if (source is not ("api" or "job" or "web" or "mobile") || severity is not ("warning" or "error"))
            throw new ArgumentException("Invalid error classification.");
        if (companyId.HasValue && (companyId <= 0 || string.IsNullOrWhiteSpace(tenantId)))
            throw new ArgumentException("Company attribution requires a trusted tenant.");
        if ((tenantId?.Length ?? 0) > 32 || (userId?.Length ?? 0) > 450 ||
            (service?.Length ?? 0) > 128 || (action?.Length ?? 0) > 128 ||
            (correlationId?.Length ?? 0) > 128 || summary.Length is 0 or > 128 ||
            (client?.Length ?? 0) > 32 || (browser?.Length ?? 0) > 32 ||
            (ipAddress?.Length ?? 0) > 45 || (methodFramesJson?.Length ?? 0) > 32768)
            throw new ArgumentException("Error log metadata exceeds its bounds.");
        return new ErrorLogEntry
        {
            Id = id, OccurredOnUtc = occurredOnUtc, Source = source, Severity = severity,
            TenantId = tenantId, CompanyId = companyId, UserId = userId, Service = service,
            Action = action, StatusCode = statusCode, DurationMs = durationMs,
            CorrelationId = correlationId, Summary = summary, Client = client,
            Browser = browser, IpAddress = ipAddress, MethodFramesJson = methodFramesJson
        };
    }
}

public sealed class ErrorLogRetentionSettings
{
    private ErrorLogRetentionSettings() { }
    public int Id { get; private set; } = 1;
    public int RetentionDays { get; private set; } = 90;
    public long Revision { get; private set; }

    public static ErrorLogRetentionSettings CreateDefault() => new();

    public bool Change(int retentionDays, long expectedRevision)
    {
        if (retentionDays is < 1 or > 3650) throw new ArgumentOutOfRangeException(nameof(retentionDays));
        if (expectedRevision != Revision) throw new InvalidOperationException("Stale retention revision.");
        if (RetentionDays == retentionDays) return false;
        RetentionDays = retentionDays;
        Revision++;
        return true;
    }
}
