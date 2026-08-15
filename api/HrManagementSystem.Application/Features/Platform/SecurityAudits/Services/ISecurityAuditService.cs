using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;

namespace HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;

public interface ISecurityAuditService
{
    void Add(SecurityAuditRequest request);

    Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default);
}
