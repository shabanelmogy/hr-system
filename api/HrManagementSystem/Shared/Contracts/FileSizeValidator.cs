namespace HrManagementSystem.Shared.Contracts
{
    public class FileSizeValidator : AbstractValidator<IFormFile>
    {
        private readonly IStringLocalizer<IFormFile> _localizer;

        public FileSizeValidator(IStringLocalizer<IFormFile> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x)
                .Must((request, context) => request.Length <= FileSettings.MaxFileSizeInBytes)
                .WithMessage(_localizer["InvalidFileSize"])
                .When(x => x is not null);
        }
    }
}