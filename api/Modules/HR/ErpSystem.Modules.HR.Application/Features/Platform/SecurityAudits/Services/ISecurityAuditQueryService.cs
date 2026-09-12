using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Platform.SecurityAudits.Services;

public interface ISecurityAuditQueryService
{
    Task<Result<SecurityAuditPageResponse>> GetAsync(
        SecurityAuditQueryRequest request,
        CancellationToken cancellationToken = default);
}
