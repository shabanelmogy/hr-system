namespace ErpSystem.Modules.Platform.Application.Features.SystemLocalization;
public sealed class SystemLocalizationErrors(IStringLocalizer<SystemLocalizationErrors> localizer)
{
    public Error Invalid => new("SystemUiTexts.Invalid", localizer["SystemUiTexts.Invalid"], ErrorType.Validation);
    public Error Forbidden => new("SystemUiTexts.Forbidden", localizer["SystemUiTexts.Forbidden"], ErrorType.Forbidden);
    public Error Conflict => new("SystemUiTexts.Conflict", localizer["SystemUiTexts.Conflict"], ErrorType.Conflict);
    public Error CatalogOutdated => new("SystemUiTexts.CatalogOutdated", localizer["SystemUiTexts.CatalogOutdated"], ErrorType.Conflict);
}