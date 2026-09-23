using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;

/// <summary>
/// Read-only Crystal execution boundary for global geographical Reference Data.
/// It consumes deployment-owned RPT files directly and never enters a tenant or
/// company report store.
/// </summary>
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/global-crystal-reports")]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
[HasPermission(ReportingPermissions.ViewGlobalCrystalReports)]
public sealed class GlobalCrystalReportsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<GlobalCrystalReportListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get(
        [FromQuery] string entityKey,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new GetGlobalCrystalReportsQuery(entityKey),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{sourceId}/render")]
    [Produces("application/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Render(
        string sourceId,
        [FromBody] GlobalCrystalReportRenderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RenderGlobalCrystalReportQuery(
            sourceId,
            request.EntityKey,
            request.ExpectedSha256,
            request.Language,
            request.Filters), cancellationToken);
        return result.IsSuccess
            ? File(result.Value.Content, result.Value.ContentType, enableRangeProcessing: false)
            : result.ToProblem();
    }
}
