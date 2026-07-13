namespace HrManagementSystem.Features.Platform.Localization.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class LocalizationController(ILocalizationService localizationService) : ControllerBase
{
    private readonly ILocalizationService _localizationService = localizationService;

    [HttpGet("{language}")]
    [HasPermission(Permissions.ViewLocalizations)]
    public async Task<IActionResult> GetLocalization(string language)
    {
        var result = await _localizationService.GetLocalization(language);
        return result.IsSuccess ? Ok(result) : result.ToProblem();
    }

    [HttpPost("{language}")]
    [HasPermission(Permissions.CreateLocalizations)]
    public async Task<IActionResult> SaveLocalization(string language, [FromBody] Dictionary<string, string> localizationData)
    {
        var result = await _localizationService.SaveLocalization(language, localizationData);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditLocalizations)]
    public async Task<IActionResult> UpdateLocalizationKey(LocalizationRequest request)
    {
        var result = await _localizationService.UpdateLocalizationKey(request);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpDelete("{language}/{key}")]
    [HasPermission(Permissions.DeleteLocalizations)]
    public async Task<IActionResult> DeleteLocalizationKey(string language, string key)
    {
        var result = await _localizationService.DeleteLocalizationKey(language, key);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
