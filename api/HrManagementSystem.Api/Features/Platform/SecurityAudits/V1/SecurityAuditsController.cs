using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;

namespace HrManagementSystem.Api.Features.Platform.SecurityAudits.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[Authorize]
[HasPermission(Permissions.ViewChangeLogs)]
public sealed class SecurityAuditsController(ISecurityAuditQueryService securityAuditQueryService)
    : ControllerBase
{
    [HttpGet("getAll")]
    [ProducesResponseType(typeof(SecurityAuditPageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] SecurityAuditQueryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await securityAuditQueryService.GetAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
