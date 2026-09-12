using ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Catalog.SubCategories.Contracts
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
