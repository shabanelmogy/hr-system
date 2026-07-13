namespace HrManagementSystem.Features.Platform.Localization.Errors
{
    public class LocalizationError(IStringLocalizer<RoleErrors> localizer)
    {
        private readonly IStringLocalizer<RoleErrors> _localizer = localizer;

        public Error LocalizationFileNotFound =>
            new("Localization.LocalizationFileNotFound", _localizer[nameof(LocalizationFileNotFound)], StatusCodes.Status404NotFound);

        public Error LocalizationKeyNotFound =>
        new("Localization.LocalizationKeyNotFound", _localizer[nameof(LocalizationKeyNotFound)], StatusCodes.Status404NotFound);

        public Error InvalidLanguage =>
            new("Localization.InvalidLanguage", _localizer[nameof(InvalidLanguage)], StatusCodes.Status400BadRequest);
    }
}
