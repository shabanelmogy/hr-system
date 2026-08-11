using HrManagementSystem.Application.Features.Catalog.Categories.Abstractions;

namespace HrManagementSystem.Application.Features.Catalog.Categories.Contracts
{
    public class CategoryRequestValidator : AbstractValidator<CategoryRequest>
    {
        private readonly ICategoryValidationQueries _queries;
        private readonly IStringLocalizer<CategoryRequest> _localizer;

        public CategoryRequestValidator(ICategoryValidationQueries queries, IStringLocalizer<CategoryRequest> localizer)
        {
            _queries = queries;
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
            !await _queries.CategoryNameArExistsAsync(category.NameAr, category.Id, cancellationToken);

        private async Task<bool> IsNameEnUniqueAsync(CategoryRequest category, CancellationToken cancellationToken) =>
            !await _queries.CategoryNameEnExistsAsync(category.NameEn, category.Id, cancellationToken);
    }
}
