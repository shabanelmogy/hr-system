using ErpSystem.Modules.Platform.Contracts.SecurityAudits;

namespace ErpSystem.Modules.Platform.Application.SecurityAudits;

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
