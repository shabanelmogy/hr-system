using ErpSystem.Modules.Platform.Application.Features.Platform.AuditTrail;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.AuditTrail.V1;

/// <summary>
/// SuperAdmin global Audit Trail for the whole system: every create, change, delete and restore of a
/// business record, captured automatically by each module. Filter by module, record
/// type, record key (a single record's history), user, action and date.
/// </summary>
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/system-audit-trail")]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
[HasPermission(PlatformPermissions.ViewSystemAuditTrail)]
public sealed class SystemAuditTrailController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(AuditTrailPageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] AuditTrailQueryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAuditTrailQuery(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("filters")]
    [ProducesResponseType(typeof(AuditTrailFiltersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilters(
        [FromQuery] string? tenantId,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAuditTrailFiltersQuery(tenantId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{moduleCode}/{id:long}")]
    [ProducesResponseType(typeof(AuditTrailDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        [FromRoute] string moduleCode,
        [FromRoute] long id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAuditTrailEntryQuery(moduleCode, id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
