using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Domain.Platform.SecurityAudits.Enums;

namespace HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;

public sealed record SecurityAuditResponse(
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
    IReadOnlyDictionary<string, string?> Metadata,
    DateTime OccurredOn);

public sealed record SecurityAuditPageResponse(
    IReadOnlyList<SecurityAuditResponse> Items,
    MetaData MetaData);
