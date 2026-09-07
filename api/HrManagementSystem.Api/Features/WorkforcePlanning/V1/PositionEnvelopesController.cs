using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/position-envelopes")]
[ApiController]
[TenantMember]
public sealed class PositionEnvelopesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewPositionEnvelopes)]
    [ProducesResponseType(typeof(PageResponse<PositionEnvelopeListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<PositionEnvelopeListItemResponse>> GetPage([FromQuery] GetPositionEnvelopesQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewPositionEnvelopes)]
    [ProducesResponseType(typeof(PositionEnvelopeDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetPositionEnvelopeByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
