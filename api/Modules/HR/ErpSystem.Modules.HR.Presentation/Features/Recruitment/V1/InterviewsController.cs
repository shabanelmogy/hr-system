using Asp.Versioning;
using ErpSystem.Modules.HR.Presentation.Common.Errors;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record CancelInterviewRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/interviews")]
[ApiController]
[TenantMember]
public sealed class InterviewsController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<InterviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? applicationId = null,
        [FromQuery] InterviewStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetInterviewsPageAsync(
            pageNumber,
            pageSize,
            applicationId,
            status,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetInterviewByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Schedule([FromBody] ScheduleInterviewMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.ScheduleInterviewAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/cancel")]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelInterviewRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CancelInterviewAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/complete")]
    [HasPermission(Permissions.ManageApplications)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Complete(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CompleteInterviewAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/evaluations")]
    [HasPermission(Permissions.EvaluateInterviews)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SubmitEvaluation(int id, [FromBody] SubmitInterviewEvaluationMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.SubmitInterviewEvaluationAsync(id, mutation, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:int}/scorecard-template")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(InterviewScorecardTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetScorecardTemplate(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetInterviewScorecardTemplateAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
