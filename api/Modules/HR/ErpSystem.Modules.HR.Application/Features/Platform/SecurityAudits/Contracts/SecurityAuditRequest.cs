using ErpSystem.Modules.HR.Domain.Platform.SecurityAudits.Enums;

namespace ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;

public sealed record SecurityAuditRequest(
    string Action,
    string TargetType,
    string? TargetId = null,
    SecurityAuditOutcome Outcome = SecurityAuditOutcome.Succeeded,
    string? Reason = null,
    string? TenantId = null,
    int? CompanyId = null,
    IReadOnlyDictionary<string, string?>? Metadata = null);
