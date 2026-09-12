using Asp.Versioning;
using ErpSystem.Modules.HR.Presentation.Common.Errors;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record RejectRequisitionRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/requisitions")]
[ApiController]
[TenantMember]
public sealed class JobRequisitionsController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobRequisitionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] JobRequisitionStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetJobRequisitionsPageAsync(
            pageNumber,
            pageSize,
            search,
            status,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetJobRequisitionByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("positions/{positionId:int}/headcount-summary")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PositionHeadcountSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHeadcountSummary(int positionId, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetPositionHeadcountSummaryAsync(positionId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("staffing-request-options")]
    [HasPermission(Permissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(IReadOnlyList<ApprovedStaffingRequestOptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStaffingRequestOptions(CancellationToken cancellationToken) =>
        Ok(await _recruitmentService.GetApprovedStaffingRequestOptionsAsync(cancellationToken));

    [HttpPost]
    [HasPermission(Permissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobRequisitionMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CreateJobRequisitionAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(Permissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.SubmitJobRequisitionAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(Permissions.ApproveJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.ApproveJobRequisitionAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ApproveJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectRequisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.RejectJobRequisitionAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/cancel")]
    [HasPermission(Permissions.ManageJobRequisitions)]
    [ProducesResponseType(typeof(JobRequisitionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(int id, [FromBody] RejectRequisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CancelJobRequisitionAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
