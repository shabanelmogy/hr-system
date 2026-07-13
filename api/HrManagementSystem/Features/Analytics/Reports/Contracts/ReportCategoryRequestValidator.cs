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
                .MustAsync(IsNameUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);
        }
        private async Task<bool> IsNameUniqueAsync(ReportCategoryRequest request, CancellationToken cancellationToken) =>
            !await _dbContext.ReportsCategories.AnyAsync(
                category => category.Name == request.Name && category.Id != request.Id,
                cancellationToken);
    }
}
