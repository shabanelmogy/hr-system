using HrManagementSystem.Application.Features.Catalog.SubCategories.Contracts;

namespace HrManagementSystem.Application.Features.Catalog.SubCategories.Errors
{
    public class SubCategoryErrors(IStringLocalizer<SubCategoryRequest> localizer)
    {
        private readonly IStringLocalizer<SubCategoryRequest> _localizer = localizer;

        public Error SubCategoryNotFound =>
            new("Subcategory.SubcategoryNotFound", _localizer[nameof(SubCategoryNotFound)], ErrorType.NotFound);

        public Error SubCategoryExists =>
            new("Subcategory.DuplicatedSubcategory", _localizer[nameof(SubCategoryExists)], ErrorType.Conflict);

        public Error SubCategoryHasContents =>
            new("Subcategory.SubCategoryHasContents", _localizer[nameof(SubCategoryHasContents)], ErrorType.Conflict);
    }
}
