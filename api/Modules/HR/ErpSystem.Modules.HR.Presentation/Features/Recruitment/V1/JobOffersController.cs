using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record DeclineOfferRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/offers")]
[ApiController]
[TenantMember]
public sealed class JobOffersController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobOfferDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? applicationId = null,
        [FromQuery] JobOfferStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetJobOffersPageQuery(pageNumber, pageSize, applicationId, status),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetJobOfferByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.CreateJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobOfferMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new CreateJobOfferCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/submit")]
    [HasPermission(HrPermissions.SubmitJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SubmitJobOfferCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(HrPermissions.ReviewJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ApproveJobOfferCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(HrPermissions.ReviewJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(int id, [FromBody] DeclineOfferRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new RejectJobOfferCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/issue")]
    [HasPermission(HrPermissions.IssueJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Issue(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new IssueJobOfferCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/accept")]
    [HasPermission(HrPermissions.RespondJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new AcceptJobOfferCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/decline")]
    [HasPermission(HrPermissions.RespondJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Decline(int id, [FromBody] DeclineOfferRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new DeclineJobOfferCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
