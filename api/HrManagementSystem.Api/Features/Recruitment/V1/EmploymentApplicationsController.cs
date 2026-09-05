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

public sealed record MoveStageRequest(ApplicationStatus TargetStatus, string? Reason);
public sealed record ApplicationReasonRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/applications")]
[ApiController]
[TenantMember]
public sealed class EmploymentApplicationsController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<EmploymentApplicationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? jobOpeningId = null,
        [FromQuery] ApplicationStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetApplicationsPageAsync(
            pageNumber,
            pageSize,
            search,
            jobOpeningId,
            status,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetApplicationByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Submit([FromBody] SubmitApplicationMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.SubmitApplicationAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/move-stage")]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> MoveStage(int id, [FromBody] MoveStageRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.MoveApplicationStageAsync(id, request.TargetStatus, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] ApplicationReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.RejectApplicationAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/withdraw")]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Withdraw(int id, [FromBody] ApplicationReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.WithdrawApplicationAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/hire")]
    [HasPermission(Permissions.HireCandidate)]
    [ProducesResponseType(typeof(EmploymentApplicationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Hire(int id, [FromBody] HireCandidateMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.HireApplicationAsync(id, mutation, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
