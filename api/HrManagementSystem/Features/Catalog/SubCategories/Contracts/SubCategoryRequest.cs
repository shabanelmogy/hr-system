namespace HrManagementSystem.Features.Catalog.SubCategories.Contracts
{
    public record SubCategoryRequest(
        int Id,
        string NameAr,
        string NameEn,
        List<int>? CategoryIds);
}
