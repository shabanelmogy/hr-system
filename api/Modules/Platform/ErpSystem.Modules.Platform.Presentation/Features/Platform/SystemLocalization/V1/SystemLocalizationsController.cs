using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Application.Features.SystemLocalization;
using Microsoft.AspNetCore.Authorization;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.SystemLocalization.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/system-ui-localizations")]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class SystemLocalizationsController(ISender sender) : ControllerBase
{
    [HttpGet("settings")]
    [HasPermission(PlatformPermissions.ViewSystemUiTexts)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetSystemLocalizationSettingsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpGet("texts")]
    [HasPermission(PlatformPermissions.ViewSystemUiTexts)]
    public async Task<IActionResult> GetTexts([FromQuery] CompanyLocalizationTextsQuery query, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetSystemLocalizationTextsQuery(query), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpGet("runtime")]
    public async Task<IActionResult> GetRuntime([FromQuery] string client, [FromQuery] string catalogVersion, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetSystemLocalizationRuntimeQuery(client, catalogVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpPut("text")]
    [HasPermission(PlatformPermissions.ViewSystemUiTexts)]
    [HasPermission(PlatformPermissions.EditSystemUiTexts)]
    public async Task<IActionResult> SetText([FromBody] SetCompanyTextRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SetSystemTextCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
    [HttpPost("reset")]
    [HasPermission(PlatformPermissions.ViewSystemUiTexts)]
    [HasPermission(PlatformPermissions.ResetSystemUiTexts)]
    public async Task<IActionResult> ResetText([FromBody] ResetCompanyTextRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ResetSystemTextCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
