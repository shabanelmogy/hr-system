namespace ErpSystem.Modules.Platform.Contracts.SecurityAudits;

public enum SecurityAuditOutcome
{
    Succeeded = 0,
    Failed = 1,
    Denied = 2
}

public sealed record SecurityAuditRequest(
    string Action,
    string TargetType,
    string? TargetId = null,
    SecurityAuditOutcome Outcome = SecurityAuditOutcome.Succeeded,
    string? Reason = null,
    string? TenantId = null,
    int? CompanyId = null,
    IReadOnlyDictionary<string, string?>? Metadata = null);

public sealed record SecurityAuditRequestContext(
    string? IpAddress,
    string? UserAgent,
    string? CorrelationId);

public sealed record SecurityAuditRecord(
    Guid Id,
    string? TenantId,
    int? CompanyId,
    string? ActorUserId,
    string Action,
    string TargetType,
    string? TargetId,
    SecurityAuditOutcome Outcome,
    string? Reason,
    string? IpAddress,
    string? UserAgent,
    string? CorrelationId,
    string? MetadataJson,
    DateTime OccurredOn);

public interface ISecurityAuditRequestContextSource
{
    SecurityAuditRequestContext GetCurrent();
}

public interface ISecurityAuditStore
{
    void Add(SecurityAuditRecord record);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface ISecurityAuditService
{
    void Add(SecurityAuditRequest request);

    Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default);
}
