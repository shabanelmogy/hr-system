using HrManagementSystem.Application.Features.Security.Authorization.Errors;

namespace HrManagementSystem.Application.Features.Platform.Localization.Errors
{
    public class LocalizationError(IStringLocalizer<RoleErrors> localizer)
    {
        private readonly IStringLocalizer<RoleErrors> _localizer = localizer;

        public Error LocalizationFileNotFound =>
            new("Localization.LocalizationFileNotFound", _localizer[nameof(LocalizationFileNotFound)], ErrorType.NotFound);

        public Error LocalizationKeyNotFound =>
        new("Localization.LocalizationKeyNotFound", _localizer[nameof(LocalizationKeyNotFound)], ErrorType.NotFound);

        public Error InvalidLanguage =>
            new("Localization.InvalidLanguage", _localizer[nameof(InvalidLanguage)], ErrorType.Validation);
    }
}
