namespace HrManagementSystem.Features.Analytics.Reports.Contracts
{
    public class ReportCategoryRequestValidator : AbstractValidator<ReportCategoryRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<ReportCategoryRequest> _localizer;

        public ReportCategoryRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<ReportCategoryRequest> localizer)
        {
            _dbContext = dbContext;
            _localizer = localizer;

            RuleFor(x => x.Name)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(x => x.Name)
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x)
                .Must(x => !IsNameDuplicated(x))
                .WithMessage(_localizer[Strings.DuplicatedValue]);
        }
        private bool IsNameDuplicated(ReportCategoryRequest request)
        {
            var newReportCategory = _dbContext.ReportsCategories.Any(c => c.Name == request.Name && c.Id != request.Id);
            return newReportCategory;
        }
    }
}
