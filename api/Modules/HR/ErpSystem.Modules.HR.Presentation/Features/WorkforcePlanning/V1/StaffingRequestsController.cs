using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workforce-planning/staffing-requests")]
[ApiController]
[TenantMember]
public sealed class StaffingRequestsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewStaffingRequests)]
    [ProducesResponseType(typeof(PageResponse<StaffingRequestListItemResponse>), StatusCodes.Status200OK)]
    public Task<PageResponse<StaffingRequestListItemResponse>> GetPage(
        [FromQuery] GetStaffingRequestsQuery query,
        CancellationToken cancellationToken) => sender.Send(query, cancellationToken);

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewStaffingRequests)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetStaffingRequestByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateStaffingRequests)]
    public async Task<IActionResult> Create(CreateStaffingRequestRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateStaffingRequestCommand(request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(Permissions.CreateStaffingRequests)]
    public async Task<IActionResult> Submit(int id, StaffingRequestActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitStaffingRequestCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(Permissions.ApproveStaffingRequests)]
    public async Task<IActionResult> Approve(int id, StaffingRequestActionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveStaffingRequestCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ApproveStaffingRequests)]
    public async Task<IActionResult> Reject(int id, RejectStaffingRequestRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectStaffingRequestCommand(id, request.Reason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/close")]
    [HasPermission(Permissions.CreateStaffingRequests)]
    public async Task<IActionResult> Close(int id, CloseStaffingRequestRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CloseStaffingRequestCommand(id, request.CloseReason, request.RowVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
