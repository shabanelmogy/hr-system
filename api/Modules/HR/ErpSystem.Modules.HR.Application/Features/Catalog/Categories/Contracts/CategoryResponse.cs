using ErpSystem.Modules.HR.Application.Features.Catalog.SubCategories.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Contracts
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
