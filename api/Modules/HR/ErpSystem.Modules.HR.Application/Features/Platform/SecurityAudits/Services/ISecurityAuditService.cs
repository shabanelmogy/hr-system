using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Services;

public interface ISecurityAuditService
{
    void Add(SecurityAuditRequest request);

    Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default);
}
