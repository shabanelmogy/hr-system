namespace HrManagementSystem.Application.Common.Contracts
{
    public class FileSizeValidator : AbstractValidator<FileUpload>
    {
        private readonly IStringLocalizer<FileUpload> _localizer;

        public FileSizeValidator(IStringLocalizer<FileUpload> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x)
                .Must((request, context) => request.Length <= FileSettings.MaxFileSizeInBytes)
                .WithMessage(_localizer["InvalidFileSize"])
                .When(x => x is not null);
        }
    }
}
