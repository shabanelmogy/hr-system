using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/postings")]
[ApiController]
[TenantMember]
public sealed class JobPostingsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobPostingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] JobPostingStatusFilter? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetJobPostingsPageQuery(pageNumber, pageSize, search, status),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetJobPostingByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobPostingMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateJobPostingCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(HrPermissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] JobPostingMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateJobPostingCommand(id, mutation), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/publish")]
    [HasPermission(HrPermissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Publish(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new PublishJobPostingCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/close")]
    [HasPermission(HrPermissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Close(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CloseJobPostingCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
