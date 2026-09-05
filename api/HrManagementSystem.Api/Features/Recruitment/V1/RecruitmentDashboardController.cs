using Asp.Versioning;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.Recruitment.Abstractions;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Api.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/dashboard")]
[ApiController]
[TenantMember]
public sealed class RecruitmentDashboardController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet("summary")]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(RecruitmentDashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _recruitmentService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(result);
    }
}
