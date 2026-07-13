namespace HrManagementSystem.Features.Analytics.Reports.Contracts
{
    public class ReportMasterRequestValidator : AbstractValidator<ReportMasterRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<ReportMasterRequest> _localizer;

        public ReportMasterRequestValidator(
            ApplicationDbContext dbContext,
            IStringLocalizer<ReportMasterRequest> localizer)
        {
            _dbContext = dbContext;
            _localizer = localizer;

            RuleFor(x => x.ReportName)
                 .Trimmed()
                 .NotEmpty()
                 .WithMessage(_localizer[Strings.Required])
                 .Length(2, 50)
                 .WithMessage(_localizer[Strings.MaxLengthError])
                 .Must(x => char.IsUpper(x[0]))
                 .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                 .Matches(@"^[A-Za-z\s]+$")
                 .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(x => x.ExportedName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(2, 50)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(cu => cu.ReportPath)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Must(BeAValidPath)
                .WithMessage(_localizer[Strings.InvalidPath])
                .Length(6, 255)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(x => x.ViewName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(x => x.Logo)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 255)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);
        }
        private bool BeAValidPath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return false;

            try
            {
                var fullPath = Path.GetFullPath(path);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
