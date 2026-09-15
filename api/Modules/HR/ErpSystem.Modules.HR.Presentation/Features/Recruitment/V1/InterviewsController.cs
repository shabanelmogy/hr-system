using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record CancelInterviewRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/interviews")]
[ApiController]
[TenantMember]
public sealed class InterviewsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<InterviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? applicationId = null,
        [FromQuery] InterviewStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetInterviewsPageQuery(pageNumber, pageSize, applicationId, status),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetInterviewByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Schedule([FromBody] ScheduleInterviewMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ScheduleInterviewCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/cancel")]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelInterviewRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CancelInterviewCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/complete")]
    [HasPermission(HrPermissions.ManageApplications)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Complete(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CompleteInterviewCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/evaluations")]
    [HasPermission(HrPermissions.EvaluateInterviews)]
    [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SubmitEvaluation(int id, [FromBody] SubmitInterviewEvaluationMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new SubmitInterviewEvaluationCommand(id, mutation),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:int}/scorecard-template")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(InterviewScorecardTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetScorecardTemplate(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetInterviewScorecardTemplateQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
