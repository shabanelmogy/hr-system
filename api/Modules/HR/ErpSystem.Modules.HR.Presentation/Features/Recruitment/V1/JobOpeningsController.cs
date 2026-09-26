using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

public sealed record OpeningReasonRequest(string Reason);

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/openings")]
[ApiController]
[TenantMember]
public sealed class JobOpeningsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<JobOpeningDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] JobOpeningStatusFilter? status = null,
        [FromQuery] int? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetJobOpeningsPageQuery(pageNumber, pageSize, search, status, departmentId),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetJobOpeningByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.CreateJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] JobOpeningMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateJobOpeningCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPost("{id:int}/open")]
    [HasPermission(HrPermissions.OpenJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Open(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new OpenJobOpeningCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/pause")]
    [HasPermission(HrPermissions.PauseJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Pause(int id, [FromBody] OpeningReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new PauseJobOpeningCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/close")]
    [HasPermission(HrPermissions.CloseJobOpenings)]
    [ProducesResponseType(typeof(JobOpeningDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Close(int id, [FromBody] OpeningReasonRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CloseJobOpeningCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
