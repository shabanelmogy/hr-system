using ErpSystem.Modules.Platform.Application.Features.Platform.Localization.Contracts;
using ErpSystem.Modules.Platform.Application.Localization;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.Localization.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class LocalizationController(ISender sender) : ControllerBase
{
    [HttpGet("{language}")]
    [HasPermission(PlatformPermissions.ViewLocalizations)]
    public async Task<IActionResult> GetLocalization(string language, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetLocalizationQuery(language), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{language}")]
    [HasPermission(PlatformPermissions.CreateLocalizations)]
    public async Task<IActionResult> SaveLocalization(string language, [FromBody] Dictionary<string, string> localizationData, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SaveLocalizationCommand(language, localizationData), cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(PlatformPermissions.EditLocalizations)]
    public async Task<IActionResult> UpdateLocalizationKey(LocalizationRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateLocalizationKeyCommand(new LocalizationKeyUpdate(request.Language, request.Key, request.Value)),
            cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpDelete("{language}/{key}")]
    [HasPermission(PlatformPermissions.DeleteLocalizations)]
    public async Task<IActionResult> DeleteLocalizationKey(string language, string key, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteLocalizationKeyCommand(language, key), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
