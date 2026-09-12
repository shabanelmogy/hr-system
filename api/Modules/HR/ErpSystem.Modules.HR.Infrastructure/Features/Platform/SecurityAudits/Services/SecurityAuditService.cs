using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Services;
using PlatformSecurityAuditOutcome = ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditOutcome;
using PlatformSecurityAuditRequest = ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditRequest;
using PlatformSecurityAuditService = ErpSystem.Modules.Platform.Contracts.SecurityAudits.ISecurityAuditService;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.SecurityAudits.Services;

public sealed class SecurityAuditService(PlatformSecurityAuditService platformSecurityAudit)
    : ISecurityAuditService
{
    public void Add(SecurityAuditRequest request) => platformSecurityAudit.Add(Map(request));

    public Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default) =>
        platformSecurityAudit.RecordAsync(Map(request), cancellationToken);

    private static PlatformSecurityAuditRequest Map(SecurityAuditRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        return new PlatformSecurityAuditRequest(
            request.Action,
            request.TargetType,
            request.TargetId,
            (PlatformSecurityAuditOutcome)(int)request.Outcome,
            request.Reason,
            request.TenantId,
            request.CompanyId,
            request.Metadata);
    }
}
