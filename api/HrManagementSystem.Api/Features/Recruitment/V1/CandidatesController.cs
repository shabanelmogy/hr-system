using Asp.Versioning;
using HrManagementSystem.Api.Common.Errors;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Recruitment.Abstractions;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Api.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/candidates")]
[ApiController]
[TenantMember]
public sealed class CandidatesController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(PageResponse<CandidateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _recruitmentService.GetCandidatesPageAsync(
            pageNumber,
            pageSize,
            search,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetCandidateByIdAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.ManageCandidates)]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CandidateMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.CreateCandidateAsync(mutation, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.ManageCandidates)]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] CandidateMutation mutation, CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.UpdateCandidateAsync(id, mutation, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
