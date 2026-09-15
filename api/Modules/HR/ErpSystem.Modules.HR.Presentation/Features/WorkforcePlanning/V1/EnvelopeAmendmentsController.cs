using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/envelope-amendments")]
[ApiController]
[TenantMember]
public sealed class EnvelopeAmendmentsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewEnvelopeAmendments)]
    [ProducesResponseType(typeof(PageResponse<EnvelopeAmendmentListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<EnvelopeAmendmentListItemResponse>> GetPage(
        [FromQuery] GetEnvelopeAmendmentsQuery query,
        CancellationToken cancellationToken) => sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewEnvelopeAmendments)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetEnvelopeAmendmentByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.CreateEnvelopeAmendments)]
    public async Task<IActionResult> Create(CreateEnvelopeAmendmentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateEnvelopeAmendmentCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(HrPermissions.CreateEnvelopeAmendments)]
    public async Task<IActionResult> Submit(int id, EnvelopeAmendmentActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitEnvelopeAmendmentCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(HrPermissions.ApproveEnvelopeAmendments)]
    public async Task<IActionResult> Approve(int id, EnvelopeAmendmentActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveEnvelopeAmendmentCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(HrPermissions.ApproveEnvelopeAmendments)]
    public async Task<IActionResult> Reject(int id, RejectEnvelopeAmendmentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectEnvelopeAmendmentCommand(id, request.Reason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
