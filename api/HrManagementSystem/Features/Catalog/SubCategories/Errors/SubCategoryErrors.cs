using HrManagementSystem.Features.Catalog.SubCategories.Contracts;

namespace HrManagementSystem.Features.Catalog.SubCategories.Errors
{
    public class SubCategoryErrors(IStringLocalizer<SubCategoryRequest> localizer)
    {
        private readonly IStringLocalizer<SubCategoryRequest> _localizer = localizer;

        public Error SubCategoryNotFound =>
            new("Subcategory.SubcategoryNotFound", _localizer[nameof(SubCategoryNotFound)], StatusCodes.Status404NotFound);

        public Error SubCategoryExists =>
            new("Subcategory.DuplicatedSubcategory", _localizer[nameof(SubCategoryExists)], StatusCodes.Status409Conflict);

        public Error SubCategoryHasContents =>
            new("Subcategory.SubCategoryHasContents", _localizer[nameof(SubCategoryHasContents)], StatusCodes.Status409Conflict);
    }
}
