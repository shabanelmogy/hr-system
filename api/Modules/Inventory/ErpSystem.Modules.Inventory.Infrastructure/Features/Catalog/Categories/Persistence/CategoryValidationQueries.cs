using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;

namespace ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.Categories.Persistence;

public sealed class CategoryValidationQueries(InventoryDbContext context, ICurrentActor currentActor)
    : ICategoryValidationQueries
{
    public Task<bool> CategoryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        ScopedCategories().AnyAsync(
            category => category.NameAr == name &&
                        (!excludedId.HasValue || category.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> CategoryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        ScopedCategories().AnyAsync(
            category => category.NameEn == name &&
                        (!excludedId.HasValue || category.Id != excludedId.Value),
            cancellationToken);

    public Task<int> CountActiveCategoriesAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken) =>
        ScopedCategories().CountAsync(
            category => ids.Contains(category.Id) && !category.IsDeleted,
            cancellationToken);

    private IQueryable<Category> ScopedCategories()
    {
        var scope = CatalogScope.Require(currentActor);
        return context.Categories.Where(category =>
            category.TenantId == scope.TenantId &&
            category.CompanyId == scope.CompanyId);
    }
}
