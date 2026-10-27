using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.CompanyLocalization.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/company-localizations")]
[ApiController]
[TenantMember]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CompanyLocalizationsController(ISender sender) : ControllerBase
{
    [HttpGet("settings")]
    [HasPermission(PlatformPermissions.ViewCompanyLocalizations)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCompanyLocalizationSettingsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpGet("texts")]
    [HasPermission(PlatformPermissions.ViewCompanyLocalizations)]
    public async Task<IActionResult> GetTexts([FromQuery] CompanyLocalizationTextsQuery query, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCompanyLocalizationTextsQuery(query), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpGet("runtime")]
    public async Task<IActionResult> GetRuntime([FromQuery] string client, [FromQuery] string catalogVersion, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCompanyLocalizationRuntimeQuery(client, catalogVersion), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpPut("default")]
    [HasPermission(PlatformPermissions.SetCompanyLocalizationDefault)]
    public async Task<IActionResult> SetDefault([FromBody] SetCompanyLanguageRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SetCompanyLanguageCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
    [HttpPut("text")]
    [HasPermission(PlatformPermissions.EditCompanyLocalizations)]
    public async Task<IActionResult> SetText([FromBody] SetCompanyTextRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SetCompanyTextCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
    [HttpPost("reset")]
    [HasPermission(PlatformPermissions.ResetCompanyLocalizations)]
    public async Task<IActionResult> ResetText([FromBody] ResetCompanyTextRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ResetCompanyTextCommand(request), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
