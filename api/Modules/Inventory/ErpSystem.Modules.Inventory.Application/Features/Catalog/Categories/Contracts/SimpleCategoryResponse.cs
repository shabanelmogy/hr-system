namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts
{
    public record SimpleCategoryResponse(
        int Id,
        string NameAr,
        string NameEn,
        bool IsDeleted);
}
