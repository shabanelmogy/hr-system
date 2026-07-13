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
                .MustAsync(IsNameArUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(s => s)
                .MustAsync(IsNameEnUniqueAsync)
                   .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(s => s.CategoryIds)
                        .NotNull()
                        .WithMessage(_localizer[Strings.Required])
                        .MustAsync(AreCategoriesValidAsync)
                        .WithMessage(_localizer[Strings.InvalidValues])
                        .Must(ids => ids is not null && ids.Count == ids.Distinct().Count())
                        .WithMessage(_localizer[Strings.DuplicatedValue]);
        }

        private async Task<bool> IsNameArUniqueAsync(SubCategoryRequest subcategory, CancellationToken cancellationToken) =>
            !await _dbContext.SubCategories.AnyAsync(
                candidate => candidate.NameAr == subcategory.NameAr && candidate.Id != subcategory.Id,
                cancellationToken);

        private async Task<bool> IsNameEnUniqueAsync(SubCategoryRequest subcategory, CancellationToken cancellationToken) =>
            !await _dbContext.SubCategories.AnyAsync(
                candidate => candidate.NameEn == subcategory.NameEn && candidate.Id != subcategory.Id,
                cancellationToken);

        private async Task<bool> AreCategoriesValidAsync(IList<int>? ids, CancellationToken cancellationToken)
        {
            if (ids is null)
                return false;

            var distinctIds = ids.Distinct().ToArray();
            var existingCount = await _dbContext.Categories.CountAsync(
                category => distinctIds.Contains(category.Id) && !category.IsDeleted,
                cancellationToken);
            return existingCount == distinctIds.Length;
        }
    }
}
