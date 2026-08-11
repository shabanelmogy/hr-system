using HrManagementSystem.Application.Features.Catalog.Categories.Contracts;

namespace HrManagementSystem.Application.Features.Catalog.Categories.Errors
{
    public class CategoryErrors(IStringLocalizer<CategoryRequest> localizer)
    {
        private readonly IStringLocalizer<CategoryRequest> _localizer = localizer;

        public Error CategoryNotFound =>
            new("Category.CategoryNotFound", _localizer[nameof(CategoryNotFound)], ErrorType.NotFound);

        public Error CategoryExists =>
            new("Category.DuplicatedCategory", _localizer[nameof(CategoryExists)], ErrorType.Conflict);

        public Error CategoryHasContents =>
            new("Category.CategoryHasContents", _localizer[nameof(CategoryHasContents)], ErrorType.Validation);

        public Error CategoryHasSubCategories =>
            new("Category.CategoryHasSubCategories", _localizer[nameof(CategoryHasSubCategories)], ErrorType.Validation);
    }
}
