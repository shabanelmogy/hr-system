using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;

namespace ErpSystem.Modules.Platform.Domain.Platform.MessageLogs;

public sealed class MessageLogEntry : ICompanyScoped
{
    private MessageLogEntry() { }
    public Guid Id { get; private set; }
    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string? UserId { get; private set; }
    public string? CorrelationId { get; private set; }
    public DateTime StartedOnUtc { get; private set; }
    public DateTime? CompletedOnUtc { get; private set; }
    public long? DurationMs { get; private set; }
    public string Type { get; private set; } = "email";
    public string TemplateId { get; private set; } = string.Empty;
    public string Language { get; private set; } = "en";
    public string Recipient { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string? SnapshotHtml { get; private set; }
    public bool SnapshotTruncated { get; private set; }
    public string Status { get; private set; } = "pending";
    public string Phase { get; private set; } = "configuration";
    public string? Cause { get; private set; }
    public int? SmtpStatusCode { get; private set; }

    public static bool IsStatus(string value) => value is "pending" or "accepted" or "failed" or "cancelled" or "uncertain";
    public static bool IsPhase(string value) => value is "configuration" or "render" or "connect" or "authenticate" or "send" or "accepted" or "disconnect";
    public static bool IsCause(string? value) => value is null or "disabled" or "configuration" or "content" or "connection" or "authentication" or "rejected" or "cancelled" or "communication" or "unknown";

    public static MessageLogEntry Start(Guid id, string tenantId, int companyId, string? userId, string? correlationId,
        DateTime startedOnUtc, string templateId, string language, string recipient)
    {
        if (id == Guid.Empty || string.IsNullOrWhiteSpace(tenantId) || tenantId.Length > 32 || companyId <= 0 ||
            startedOnUtc.Kind != DateTimeKind.Utc || !AccountEmailCatalog.IsLanguage(language) || AccountEmailCatalog.Find(templateId) is null ||
            string.IsNullOrWhiteSpace(recipient) || recipient.Length > 320 || recipient.Any(char.IsControl) ||
            (userId?.Length ?? 0) > 450 || (correlationId?.Length ?? 0) > 128)
            throw new ArgumentException("Invalid company message attempt.");
        return new() { Id = id, TenantId = tenantId, CompanyId = companyId, UserId = userId,
            CorrelationId = correlationId, StartedOnUtc = startedOnUtc, TemplateId = templateId, Language = language, Recipient = recipient };
    }

    public void SetSnapshot(string subject, string html, bool truncated)
    {
        if (Status != "pending" || SnapshotHtml is not null || subject.Length > 512 || html.Length > 65536 || subject.Any(char.IsControl))
            throw new InvalidOperationException("Invalid immutable message snapshot.");
        Subject = subject; SnapshotHtml = html; SnapshotTruncated = truncated;
    }

    public bool Complete(DateTime completedOnUtc, long durationMs, string status, string phase, string? cause, int? smtpStatusCode)
    {
        if (completedOnUtc.Kind != DateTimeKind.Utc || completedOnUtc < StartedOnUtc || durationMs < 0 ||
            !IsStatus(status) || status == "pending" || !IsPhase(phase) || !IsCause(cause) || smtpStatusCode is < 100 or > 599 ||
            (status == "accepted" && cause is not null))
            throw new ArgumentException("Invalid message outcome.");
        if (Status != "pending") return false;
        CompletedOnUtc = completedOnUtc; DurationMs = durationMs; Status = status; Phase = phase; Cause = cause; SmtpStatusCode = smtpStatusCode;
        return true;
    }
}
