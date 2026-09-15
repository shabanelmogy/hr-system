using ErpSystem.Modules.Platform.Application.Files.Settings;

namespace ErpSystem.Modules.Platform.Application.Files.Validation
{
    public class FileSizeValidator : AbstractValidator<FileUpload>
    {
        private readonly IStringLocalizer<FileUpload> _localizer;

        public FileSizeValidator(
            IStringLocalizer<FileUpload> localizer,
            int maxFileSizeInMB = FileSettings.MaxFileSizeInMB)
        {
            _localizer = localizer;
            var maxFileSizeInBytes = maxFileSizeInMB * 1024L * 1024L;

            RuleFor(x => x)
                .Must((request, context) => request.Length <= maxFileSizeInBytes)
                .WithMessage(_localizer["InvalidFileSize", maxFileSizeInMB])
                .When(x => x is not null);
        }
    }
}
