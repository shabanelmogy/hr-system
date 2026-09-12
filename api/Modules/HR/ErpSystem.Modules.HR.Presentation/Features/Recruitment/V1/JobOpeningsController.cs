using Asp.Versioning;
using ErpSystem.Modules.HR.Presentation.Common.Errors;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record OpeningReasonRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/openings")]
[ApiController]
[TenantMember]
public sealed class JobOpeningsController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobOpeningDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] JobOpeningStatusFilter? status = null,
        [FromQuery] int? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetJobOpeningsPageAsync(
            pageNumber,
            pageSize,
            search,
            status,
            departmentId,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetJobOpeningByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobOpeningMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CreateJobOpeningAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/open")]
    [HasPermission(Permissions.ManageJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Open(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.OpenJobOpeningAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/pause")]
    [HasPermission(Permissions.ManageJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Pause(int id, [FromBody] OpeningReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.PauseJobOpeningAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/close")]
    [HasPermission(Permissions.ManageJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Close(int id, [FromBody] OpeningReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CloseJobOpeningAsync(id, request.Reason, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
