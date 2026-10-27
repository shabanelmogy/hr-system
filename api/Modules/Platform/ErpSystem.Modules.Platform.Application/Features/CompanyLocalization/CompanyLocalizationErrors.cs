namespace ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
public sealed class CompanyLocalizationErrors(IStringLocalizer<CompanyLocalizationErrors> localizer)
{
    public Error Invalid => new("CompanyLocalizations.Invalid", localizer["CompanyLocalizations.Invalid"], ErrorType.Validation);
    public Error Forbidden => new("CompanyLocalizations.Forbidden", localizer["CompanyLocalizations.Forbidden"], ErrorType.Forbidden);
    public Error Conflict => new("CompanyLocalizations.Conflict", localizer["CompanyLocalizations.Conflict"], ErrorType.Conflict);
    public Error CatalogOutdated => new("CompanyLocalizations.CatalogOutdated", localizer["CompanyLocalizations.CatalogOutdated"], ErrorType.Conflict);
}