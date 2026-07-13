namespace HrManagementSystem.Features.Catalog.Categories.Contracts
{
    public class CategoryRequestValidator : AbstractValidator<CategoryRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<CategoryRequest> _localizer;

        public CategoryRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<CategoryRequest> localizer)
        {
            _dbContext = dbContext;
            _localizer = localizer;

            RuleFor(c => c.NameAr)
                .Trimmed()
                .NotEmpty()
                .Length(3, 100)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Matches(@"^[\p{IsArabic}\s]+$")
                .WithMessage(_localizer[Strings.ArabicLetterOnly]);

            RuleFor(c => c.NameEn)
                .Trimmed()
                .NotEmpty()
                .Length(3, 100)
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(c => c)
                .MustAsync(IsNameArUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(c => c)
                .MustAsync(IsNameEnUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);

        }

        private async Task<bool> IsNameArUniqueAsync(CategoryRequest category, CancellationToken cancellationToken) =>
            !await _dbContext.Categories.AnyAsync(
                candidate => candidate.NameAr == category.NameAr && candidate.Id != category.Id,
                cancellationToken);

        private async Task<bool> IsNameEnUniqueAsync(CategoryRequest category, CancellationToken cancellationToken) =>
            !await _dbContext.Categories.AnyAsync(
                candidate => candidate.NameEn == category.NameEn && candidate.Id != category.Id,
                cancellationToken);
    }
}
