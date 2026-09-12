namespace ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Contracts
{
    public record SimpleCategoryResponse(
        int Id,
        string NameAr,
        string NameEn,
        bool IsDeleted);
}
