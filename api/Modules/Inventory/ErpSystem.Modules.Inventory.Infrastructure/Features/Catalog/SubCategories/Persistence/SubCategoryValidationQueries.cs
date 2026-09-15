using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;

namespace ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.SubCategories.Persistence;

public sealed class SubCategoryValidationQueries(InventoryDbContext context, ICurrentActor currentActor)
    : ISubCategoryValidationQueries
{
    public Task<bool> SubCategoryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        ScopedSubCategories().AnyAsync(
            subCategory => subCategory.NameAr == name &&
                           (!excludedId.HasValue || subCategory.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> SubCategoryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        ScopedSubCategories().AnyAsync(
            subCategory => subCategory.NameEn == name &&
                           (!excludedId.HasValue || subCategory.Id != excludedId.Value),
            cancellationToken);

    private IQueryable<SubCategory> ScopedSubCategories()
    {
        var scope = CatalogScope.Require(currentActor);
        return context.SubCategories.Where(subCategory =>
            subCategory.TenantId == scope.TenantId &&
            subCategory.CompanyId == scope.CompanyId);
    }
}
