using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/budgets")]
[ApiController]
[TenantMember]
public sealed class WorkforceBudgetsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(PageResponse<WorkforceBudgetListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<WorkforceBudgetListItemResponse>> GetPage([FromQuery] GetWorkforceBudgetsQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(WorkforceBudgetDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetWorkforceBudgetByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("source-plans")]
    [HasPermission(HrPermissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(PageResponse<BudgetSourcePlanResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<BudgetSourcePlanResponse>> GetSourcePlans([FromQuery] GetBudgetSourcePlansQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("source-plans/{planId:int}")]
    [HasPermission(HrPermissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(BudgetSourcePlanResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSourcePlanById([FromRoute] int planId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetBudgetSourcePlanByIdQuery(planId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.ManageWorkforceBudgets)]
    [ProducesResponseType(typeof(WorkforceBudgetDetailResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateWorkforceBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateWorkforceBudgetCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(HrPermissions.ManageWorkforceBudgets)]
    [ProducesResponseType(typeof(WorkforceBudgetDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateWorkforceBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateWorkforceBudgetCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(HrPermissions.ManageWorkforceBudgets)]
    public async Task<IActionResult> Submit([FromRoute] int id, [FromBody] WorkforceBudgetActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitWorkforceBudgetCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = PlatformRoleNames.Admin)]
    public async Task<IActionResult> Approve([FromRoute] int id, [FromBody] WorkforceBudgetActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveWorkforceBudgetCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(HrPermissions.ManageWorkforceBudgets)]
    public async Task<IActionResult> Reject([FromRoute] int id, [FromBody] RejectWorkforceBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectWorkforceBudgetCommand(id, request.Reason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
