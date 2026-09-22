using Asp.Versioning;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/recruitment/settings")]
[ApiController]
[TenantMember]
public sealed class RecruitmentSettingsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewRecruitment)]
    [ProducesResponseType(typeof(RecruitmentSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        var settings = await sender.Send(new GetRecruitmentSettingsQuery(), cancellationToken);
        return Ok(settings);
    }

    [HttpPut]
    [HasPermission(HrPermissions.ManageJobOpenings)]
    [ProducesResponseType(typeof(RecruitmentSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSettings([FromBody] RecruitmentSettingsDto updatedSettings, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateRecruitmentSettingsCommand(updatedSettings),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
