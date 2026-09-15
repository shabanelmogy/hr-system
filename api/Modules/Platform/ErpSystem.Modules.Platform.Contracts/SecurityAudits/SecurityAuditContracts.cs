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

public interface ISecurityAuditService
{
    void Add(SecurityAuditRequest request);

    Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default);
}
