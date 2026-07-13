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
                .Must(c => !IsNameArDuplicated(c))
                .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(c => c)
                .Must(c => !IsNameEnDuplicated(c))
                .WithMessage(_localizer[Strings.DuplicatedValue]);

        }

        private bool IsNameArDuplicated(CategoryRequest category)
        {
            return _dbContext.Categories.Any(c => c.NameAr == category.NameAr && c.Id != category.Id);
        }

        private bool IsNameEnDuplicated(CategoryRequest category)
        {
            return _dbContext.Categories.Any(c => c.NameEn == category.NameEn && c.Id != category.Id);
        }
    }
}