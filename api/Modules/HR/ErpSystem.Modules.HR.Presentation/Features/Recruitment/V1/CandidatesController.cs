using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/candidates")]
[ApiController]
[TenantMember]
public sealed class CandidatesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<CandidateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetCandidatesPageQuery(pageNumber, pageSize, search),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCandidateByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(HrPermissions.ManageCandidates)]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CandidateMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateCandidateCommand(mutation), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(HrPermissions.ManageCandidates)]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] CandidateMutation mutation, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateCandidateCommand(id, mutation), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
