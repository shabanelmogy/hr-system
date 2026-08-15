using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;

namespace HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;

public interface ISecurityAuditQueryService
{
    Task<Result<SecurityAuditPageResponse>> GetAsync(
        SecurityAuditQueryRequest request,
        CancellationToken cancellationToken = default);
}
