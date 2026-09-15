using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record RejectRequisitionRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/requisitions")]
[ApiController]
[TenantMember]
public sealed class JobRequisitionsController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobRequisitionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] JobRequisitionStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetJobRequisitionsPageQuery(pageNumber, pageSize, search, status),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetJobRequisitionByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("positions/{positionId:int}/headcount-summary")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PositionHeadcountSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHeadcountSummary(int positionId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetPositionHeadcountSummaryQuery(positionId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("staffing-request-options")]
    [HasPermission(HrPermissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(IReadOnlyList<ApprovedStaffingRequestOptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStaffingRequestOptions(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetApprovedStaffingRequestOptionsQuery(), cancellationToken));

    [HttpPost]
    [HasPermission(HrPermissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobRequisitionMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new CreateJobRequisitionCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(HrPermissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SubmitJobRequisitionCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(HrPermissions.ApproveJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ApproveJobRequisitionCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(HrPermissions.ApproveJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectRequisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new RejectJobRequisitionCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/cancel")]
    [HasPermission(HrPermissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(int id, [FromBody] RejectRequisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new CancelJobRequisitionCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
