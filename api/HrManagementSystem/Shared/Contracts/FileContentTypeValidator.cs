namespace HrManagementSystem.Shared.Contracts
{
    public class FileContentTypeValidator : AbstractValidator<IFormFile>
    {
        private readonly IStringLocalizer<IFormFile> _localizer;

        public FileContentTypeValidator(IStringLocalizer<IFormFile> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.ContentType)
                .Must(contentType => FileSettings.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
                .WithMessage(_localizer[Strings.ExtensionFileNotAllowed])
                .When(x => x is not null);
        }
    }
}
