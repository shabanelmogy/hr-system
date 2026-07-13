using HrManagementSystem.Features.Catalog.Categories.Contracts;

namespace HrManagementSystem.Features.Catalog.SubCategories.Contracts
{
    public record SubCategoryResponse(
        int Id,
        string NameAr,
        string NameEn,
        DateTime CreatedOn,
        DateTime? UpdatedOn,
        bool IsDeleted,
        List<SimpleCategoryResponse>? Categories = null
        );
}
