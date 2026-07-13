using HrManagementSystem.Features.Catalog.Categories.Contracts;

namespace HrManagementSystem.Features.Catalog.Categories.Errors
{
    public class CategoryErrors(IStringLocalizer<CategoryRequest> localizer)
    {
        private readonly IStringLocalizer<CategoryRequest> _localizer = localizer;

        public Error CategoryNotFound =>
            new("Category.CategoryNotFound", _localizer[nameof(CategoryNotFound)], StatusCodes.Status404NotFound);

        public Error CategoryExists =>
            new("Category.DuplicatedCategory", _localizer[nameof(CategoryExists)], StatusCodes.Status409Conflict);

        public Error CategoryHasContents =>
            new("Category.CategoryHasContents", _localizer[nameof(CategoryHasContents)], StatusCodes.Status400BadRequest);

        public Error CategoryHasSubCategories =>
            new("Category.CategoryHasSubCategories", _localizer[nameof(CategoryHasSubCategories)], StatusCodes.Status400BadRequest);
    }
}
