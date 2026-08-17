namespace HrManagementSystem.Application.Common.Contracts
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
