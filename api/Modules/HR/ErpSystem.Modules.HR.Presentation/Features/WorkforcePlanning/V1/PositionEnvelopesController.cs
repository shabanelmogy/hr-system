using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/position-envelopes")]
[ApiController]
[TenantMember]
public sealed class PositionEnvelopesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewPositionEnvelopes)]
    [ProducesResponseType(typeof(PageResponse<PositionEnvelopeListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<PositionEnvelopeListItemResponse>> GetPage([FromQuery] GetPositionEnvelopesQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewPositionEnvelopes)]
    [ProducesResponseType(typeof(PositionEnvelopeDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetPositionEnvelopeByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
