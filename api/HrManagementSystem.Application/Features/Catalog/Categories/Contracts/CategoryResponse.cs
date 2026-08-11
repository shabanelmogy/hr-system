using HrManagementSystem.Application.Features.Catalog.SubCategories.Contracts;

namespace HrManagementSystem.Application.Features.Catalog.Categories.Contracts
{
    public record CategoryResponse(
        int Id,
        string NameAr,
        string NameEn,
        List<SimpleSubCategoryResponse> SubCategories,
        DateTime CreatedOn,
        DateTime? UpdatedOn,
        bool IsDeleted);
}
