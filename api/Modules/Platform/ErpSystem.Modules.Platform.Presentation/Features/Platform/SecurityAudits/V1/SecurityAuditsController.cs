using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.SecurityAudits.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[Authorize]
[HasPermission(PlatformPermissions.ViewChangeLogs)]
public sealed class SecurityAuditsController(ISender sender)
    : ControllerBase
{
    [HttpGet("getAll")]
    [ProducesResponseType(typeof(SecurityAuditPageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] SecurityAuditQueryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetSecurityAuditsQuery(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
