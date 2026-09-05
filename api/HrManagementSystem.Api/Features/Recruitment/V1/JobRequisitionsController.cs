using Asp.Versioning;
using HrManagementSystem.Api.Common.Errors;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Recruitment.Abstractions;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Domain.Recruitment.Enums;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Api.Features.Recruitment.V1;

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
        [FromQuery] JobRequisitionStatus? status = null,
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
}
