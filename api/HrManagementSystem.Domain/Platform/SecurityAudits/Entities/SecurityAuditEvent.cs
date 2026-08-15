using HrManagementSystem.Domain.Platform.SecurityAudits.Enums;

namespace HrManagementSystem.Domain.Platform.SecurityAudits.Entities;

public sealed class SecurityAuditEvent
{
    private SecurityAuditEvent()
    {
    }

    public SecurityAuditEvent(
        Guid id,
        string action,
        string targetType,
        SecurityAuditOutcome outcome,
        DateTime occurredOn,
        string? tenantId,
        int? companyId,
        string? actorUserId,
        string? targetId,
        string? reason,
        string? ipAddress,
        string? userAgent,
        string? correlationId,
        string? metadataJson)
    {
        Id = id;
        Action = Required(action, nameof(action));
        TargetType = Required(targetType, nameof(targetType));
        Outcome = outcome;
        OccurredOn = occurredOn;
        TenantId = Optional(tenantId);
        CompanyId = companyId;
        ActorUserId = Optional(actorUserId);
        TargetId = Optional(targetId);
        Reason = Optional(reason);
        IpAddress = Optional(ipAddress);
        UserAgent = Optional(userAgent);
        CorrelationId = Optional(correlationId);
        MetadataJson = Optional(metadataJson);
    }

    public Guid Id { get; private set; }
    public string? TenantId { get; private set; }
    public int? CompanyId { get; private set; }
    public string? ActorUserId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string TargetType { get; private set; } = string.Empty;
    public string? TargetId { get; private set; }
    public SecurityAuditOutcome Outcome { get; private set; }
    public string? Reason { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? CorrelationId { get; private set; }
    public string? MetadataJson { get; private set; }
    public DateTime OccurredOn { get; private set; }

    private static string Required(string value, string parameterName) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("A value is required.", parameterName)
            : value.Trim();

    private static string? Optional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
