namespace HrManagementSystem.Application.Common.Contracts
{
    public class FileContentTypeValidator : AbstractValidator<FileUpload>
    {
        private readonly IStringLocalizer<FileUpload> _localizer;

        public FileContentTypeValidator(IStringLocalizer<FileUpload> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.ContentType)
                .Must(contentType => FileSettings.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
                .WithMessage(_localizer[Strings.ExtensionFileNotAllowed])
                .When(x => x is not null);
        }
    }
}
