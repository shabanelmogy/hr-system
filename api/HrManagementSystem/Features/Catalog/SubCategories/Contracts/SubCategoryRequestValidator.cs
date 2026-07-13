namespace HrManagementSystem.Features.Catalog.SubCategories.Contracts
{
    public class SubCategoryRequestValidator : AbstractValidator<SubCategoryRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<SubCategoryRequest> _localizer;

        public SubCategoryRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<SubCategoryRequest> localizer)
        {
            _dbContext = dbContext;
            _localizer = localizer;

            RuleFor(s => s.NameAr)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 100)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(s => s.NameEn)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 100)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(s => s)
                .Must(s => !IsNameArDuplicated(s))
                .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(s => s)
                .Must(s => !IsNameEnDuplicated(s))
                   .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(s => s.CategoryIds)
                        .NotNull()
                        .WithMessage(_localizer[_localizer[Strings.Required]])
                        .Must(ids => ids.All(id => _dbContext.Categories.Any(c => c.Id == id)))
                        .WithMessage(_localizer[Strings.InvalidValues])
                        .Must(ids => ids.Count == ids.Distinct().Count())
                        .WithMessage(_localizer[Strings.DuplicatedValue]);
        }

        private bool IsNameArDuplicated(SubCategoryRequest subcategory)
        {
            return _dbContext.SubCategories.Any(s => s.NameAr == subcategory.NameAr && s.Id != subcategory.Id);
        }

        private bool IsNameEnDuplicated(SubCategoryRequest subcategory)
        {
            return _dbContext.SubCategories.Any(s => s.NameEn == subcategory.NameEn && s.Id != subcategory.Id);
        }
    }
}