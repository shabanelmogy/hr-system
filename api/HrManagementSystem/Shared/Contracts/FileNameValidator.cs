namespace HrManagementSystem.Shared.Contracts
{
    public class FileNameValidator : AbstractValidator<IFormFile>
    {
        private readonly IStringLocalizer<IFormFile> _iformLocalizer;
        public FileNameValidator(IStringLocalizer<IFormFile> iformLocalizer)
        {
            _iformLocalizer = iformLocalizer;

            //RuleFor(x => x.FileName)
            //    .Matches("^[A-Za-z0-9_\\-.]*$")
            //    .WithMessage(_iformLocalizer["InvalidFileName"])
            //    .When(x => x is not null);

            RuleFor(x => x.FileName)
                .Matches("^[A-Za-z0-9_\\-. ]*$") // Added space to the pattern
                .WithMessage(_iformLocalizer[Strings.InvalidFileName])
                .When(x => x is not null);
        }
    }
}