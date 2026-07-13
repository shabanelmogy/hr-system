namespace HrManagementSystem.Features.Platform.Localization.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class LocalizationController(ILocalizationService localizationService) : ControllerBase
{
    private readonly ILocalizationService _localizationService = localizationService;

    [HttpGet("{language}")]
    [HasPermission(Permissions.ViewLocalizations)]
    public async Task<IActionResult> GetLocalization(string language, CancellationToken cancellationToken)
    {
        var result = await _localizationService.GetLocalization(language, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{language}")]
    [HasPermission(Permissions.CreateLocalizations)]
    public async Task<IActionResult> SaveLocalization(string language, [FromBody] Dictionary<string, string> localizationData, CancellationToken cancellationToken)
    {
        var result = await _localizationService.SaveLocalization(language, localizationData, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditLocalizations)]
    public async Task<IActionResult> UpdateLocalizationKey(LocalizationRequest request, CancellationToken cancellationToken)
    {
        var result = await _localizationService.UpdateLocalizationKey(request, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpDelete("{language}/{key}")]
    [HasPermission(Permissions.DeleteLocalizations)]
    public async Task<IActionResult> DeleteLocalizationKey(string language, string key, CancellationToken cancellationToken)
    {
        var result = await _localizationService.DeleteLocalizationKey(language, key, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
