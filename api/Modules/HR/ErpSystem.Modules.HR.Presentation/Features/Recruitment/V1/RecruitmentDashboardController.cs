using Asp.Versioning;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/dashboard")]
[ApiController]
[TenantMember]
public sealed class RecruitmentDashboardController(ISender sender) : ControllerBase
{
    [HttpGet("summary")]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(RecruitmentDashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetRecruitmentDashboardSummaryQuery(), cancellationToken);
        return Ok(result);
    }
}
