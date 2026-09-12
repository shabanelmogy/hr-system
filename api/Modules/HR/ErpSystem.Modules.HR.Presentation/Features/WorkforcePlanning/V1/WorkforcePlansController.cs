using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/plans")]
[ApiController]
[TenantMember]
public sealed class WorkforcePlansController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewWorkforcePlans)]
    [ProducesResponseType(typeof(PageResponse<WorkforcePlanListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<WorkforcePlanListItemResponse>> GetPage([FromQuery] GetWorkforcePlansQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewWorkforcePlans)]
    [ProducesResponseType(typeof(WorkforcePlanDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetWorkforcePlanByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateWorkforcePlans)]
    [ProducesResponseType(typeof(WorkforcePlanDetailResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateWorkforcePlanRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateWorkforcePlanCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditWorkforcePlans)]
    [ProducesResponseType(typeof(WorkforcePlanDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateWorkforcePlanRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateWorkforcePlanCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteWorkforcePlans)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Archive([FromRoute] int id, [FromBody] WorkforcePlanActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveWorkforcePlanCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteWorkforcePlans)]
    [ProducesResponseType(typeof(WorkforcePlanDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Restore([FromRoute] int id, [FromBody] WorkforcePlanActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreWorkforcePlanCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(Permissions.EditWorkforcePlans)]
    public async Task<IActionResult> Submit([FromRoute] int id, [FromBody] WorkforcePlanActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitWorkforcePlanCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/begin-review")]
    [HasPermission(Permissions.ApproveWorkforcePlans)]
    public async Task<IActionResult> BeginReview([FromRoute] int id, [FromBody] WorkforcePlanActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new BeginWorkforcePlanReviewCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(Permissions.ApproveWorkforcePlans)]
    public async Task<IActionResult> Approve([FromRoute] int id, [FromBody] WorkforcePlanActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveWorkforcePlanCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ApproveWorkforcePlans)]
    public async Task<IActionResult> Reject([FromRoute] int id, [FromBody] RejectWorkforcePlanRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectWorkforcePlanCommand(id, request.Reason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/revisions")]
    [HasPermission(Permissions.CreateWorkforcePlans)]
    public async Task<IActionResult> CreateRevision([FromRoute] int id, [FromBody] WorkforcePlanActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateWorkforcePlanRevisionCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpGet("{id:int}/revisions")]
    [HasPermission(Permissions.ViewWorkforcePlans)]
    [ProducesResponseType(typeof(IReadOnlyList<WorkforcePlanDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRevisions([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetWorkforcePlanRevisionsQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
