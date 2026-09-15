using ErpSystem.Modules.Platform.Application.Files.Settings;

namespace ErpSystem.Modules.Platform.Application.Files.Validation
{
    public class FileContentTypeValidator : AbstractValidator<FileUpload>
    {
        private readonly IStringLocalizer<FileUpload> _localizer;

        public FileContentTypeValidator(IStringLocalizer<FileUpload> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.ContentType)
                .Must(contentType => FileSettings.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
                .WithMessage(_localizer[ValidationMessageKeys.ExtensionFileNotAllowed])
                .When(x => x is not null);
        }
    }
}
