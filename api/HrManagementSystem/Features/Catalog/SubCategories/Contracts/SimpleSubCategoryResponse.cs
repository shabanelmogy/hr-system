namespace HrManagementSystem.Features.Catalog.SubCategories.Contracts
{
    public record SimpleSubCategoryResponse(
        int Id,
        string NameAr,
        string NameEn,
        bool IsDeleted
        );
}
