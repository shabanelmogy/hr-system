using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Commands;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/budgets")]
[ApiController]
[TenantMember]
public sealed class WorkforceBudgetsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(PageResponse<WorkforceBudgetListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<WorkforceBudgetListItemResponse>> GetPage([FromQuery] GetWorkforceBudgetsQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(WorkforceBudgetDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetWorkforceBudgetByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("source-plans")]
    [HasPermission(Permissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(PageResponse<BudgetSourcePlanResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<BudgetSourcePlanResponse>> GetSourcePlans([FromQuery] GetBudgetSourcePlansQuery query, CancellationToken cancellationToken) =>
        sender.Send(query, cancellationToken);

    [HttpGet("source-plans/{planId:int}")]
    [HasPermission(Permissions.ViewWorkforceBudgets)]
    [ProducesResponseType(typeof(BudgetSourcePlanResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSourcePlanById([FromRoute] int planId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetBudgetSourcePlanByIdQuery(planId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageWorkforceBudgets)]
    [ProducesResponseType(typeof(WorkforceBudgetDetailResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateWorkforceBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateWorkforceBudgetCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.ManageWorkforceBudgets)]
    [ProducesResponseType(typeof(WorkforceBudgetDetailResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateWorkforceBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateWorkforceBudgetCommand(id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(Permissions.ManageWorkforceBudgets)]
    public async Task<IActionResult> Submit([FromRoute] int id, [FromBody] WorkforceBudgetActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitWorkforceBudgetCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = AppRoles.admin)]
    public async Task<IActionResult> Approve([FromRoute] int id, [FromBody] WorkforceBudgetActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveWorkforceBudgetCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ManageWorkforceBudgets)]
    public async Task<IActionResult> Reject([FromRoute] int id, [FromBody] RejectWorkforceBudgetRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectWorkforceBudgetCommand(id, request.Reason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
