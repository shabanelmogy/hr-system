using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Commands;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/envelope-amendments")]
[ApiController]
[TenantMember]
public sealed class EnvelopeAmendmentsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewEnvelopeAmendments)]
    [ProducesResponseType(typeof(PageResponse<EnvelopeAmendmentListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<EnvelopeAmendmentListItemResponse>> GetPage(
        [FromQuery] GetEnvelopeAmendmentsQuery query,
        CancellationToken cancellationToken) => sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewEnvelopeAmendments)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetEnvelopeAmendmentByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateEnvelopeAmendments)]
    public async Task<IActionResult> Create(CreateEnvelopeAmendmentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateEnvelopeAmendmentCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(Permissions.CreateEnvelopeAmendments)]
    public async Task<IActionResult> Submit(int id, EnvelopeAmendmentActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitEnvelopeAmendmentCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(Permissions.ApproveEnvelopeAmendments)]
    public async Task<IActionResult> Approve(int id, EnvelopeAmendmentActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveEnvelopeAmendmentCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ApproveEnvelopeAmendments)]
    public async Task<IActionResult> Reject(int id, RejectEnvelopeAmendmentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectEnvelopeAmendmentCommand(id, request.Reason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
