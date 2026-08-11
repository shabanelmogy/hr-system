namespace HrManagementSystem.Application.Features.Catalog.SubCategories.Contracts
{
    public class SubCategoryRequestValidator : AbstractValidator<SubCategoryRequest>
    {
        private readonly ISubCategoryValidationQueries _subCategoryQueries;
        private readonly ICategoryValidationQueries _categoryQueries;
        private readonly IStringLocalizer<SubCategoryRequest> _localizer;

        public SubCategoryRequestValidator(
            ISubCategoryValidationQueries subCategoryQueries,
            ICategoryValidationQueries categoryQueries,
            IStringLocalizer<SubCategoryRequest> localizer)
        {
            _subCategoryQueries = subCategoryQueries;
            _categoryQueries = categoryQueries;
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
            !await _subCategoryQueries.SubCategoryNameArExistsAsync(
                subcategory.NameAr,
                subcategory.Id,
                cancellationToken);

        private async Task<bool> IsNameEnUniqueAsync(SubCategoryRequest subcategory, CancellationToken cancellationToken) =>
            !await _subCategoryQueries.SubCategoryNameEnExistsAsync(
                subcategory.NameEn,
                subcategory.Id,
                cancellationToken);

        private async Task<bool> AreCategoriesValidAsync(IList<int>? ids, CancellationToken cancellationToken)
        {
            if (ids is null)
                return false;

            var distinctIds = ids.Distinct().ToArray();
            var existingCount = await _categoryQueries.CountActiveCategoriesAsync(distinctIds, cancellationToken);
            return existingCount == distinctIds.Length;
        }
    }
}
