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

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/postings")]
[ApiController]
[TenantMember]
public sealed class JobPostingsController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobPostingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] JobPostingStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetJobPostingsPageAsync(
            pageNumber,
            pageSize,
            search,
            status,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetJobPostingByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobPostingMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CreateJobPostingAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] JobPostingMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.UpdateJobPostingAsync(id, mutation, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/publish")]
    [HasPermission(Permissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Publish(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.PublishJobPostingAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/close")]
    [HasPermission(Permissions.ManageJobPostings)]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Close(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CloseJobPostingAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
