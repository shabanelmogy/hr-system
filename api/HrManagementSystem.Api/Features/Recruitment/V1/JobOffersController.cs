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

public sealed record DeclineOfferRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/offers")]
[ApiController]
[TenantMember]
public sealed class JobOffersController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobOfferDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? applicationId = null,
        [FromQuery] JobOfferStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetJobOffersPageAsync(
            pageNumber,
            pageSize,
            applicationId,
            status,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetJobOfferByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobOfferMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CreateJobOfferAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/issue")]
    [HasPermission(Permissions.ManageJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Issue(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.IssueJobOfferAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/accept")]
    [HasPermission(Permissions.ApproveJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.AcceptJobOfferAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/decline")]
    [HasPermission(Permissions.ApproveJobOffers)]
    [ProducesResponseType(typeof(JobOfferDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Decline(int id, [FromBody] DeclineOfferRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.DeclineJobOfferAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
