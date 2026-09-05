using Asp.Versioning;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.Recruitment.Abstractions;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Api.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/settings")]
[ApiController]
[TenantMember]
public sealed class RecruitmentSettingsController(IRecruitmentService recruitmentService) : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService = recruitmentService;

    [HttpGet]
    [HasPermission(Permissions.ViewRecruitment)]
    [ProducesResponseType(typeof(RecruitmentSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        var settings = await _recruitmentService.GetSettingsAsync(cancellationToken);
        return Ok(settings);
    }

    [HttpPut]
    [HasPermission(Permissions.ManageJobOpenings)]
    [ProducesResponseType(typeof(RecruitmentSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSettings([FromBody] RecruitmentSettingsDto updatedSettings, CancellationToken cancellationToken)
    {
        var settings = await _recruitmentService.UpdateSettingsAsync(updatedSettings, cancellationToken);
        return Ok(settings);
    }
}
