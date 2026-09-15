using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog;

namespace ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.Categories.Persistence;

public sealed class CategoryReadStore(
    InventoryDbContext context,
    ICurrentActor currentActor,
    HybridCache hybridCache) : ICategoryReadStore
{
    private const string CacheKeyPrefix = "AvailableCategories";

    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return await hybridCache.GetOrCreateAsync<IReadOnlyList<CategoryResponse>>(
            CompanyScopedCatalogCacheKey.Create(CacheKeyPrefix, currentActor),
            async _ => await Query(scope.TenantId, scope.CompanyId)
                .Where(category => !category.IsDeleted)
                .Select(category => new CategoryResponse(
                    category.Id,
                    category.NameAr,
                    category.NameEn,
                    category.CategorySubcategories
                        .Where(link => link.TenantId == scope.TenantId &&
                                       link.CompanyId == scope.CompanyId &&
                                       link.SubCategory != null &&
                                       !link.SubCategory.IsDeleted)
                        .Select(link => new SimpleSubCategoryResponse(
                            link.SubCategory!.Id,
                            link.SubCategory.NameAr,
                            link.SubCategory.NameEn,
                            link.SubCategory.IsDeleted))
                        .ToList(),
                    category.CreatedOn,
                    category.UpdatedOn,
                    category.IsDeleted))
                .ToListAsync(cancellationToken),
            cancellationToken: cancellationToken);
    }

    public Task<CategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return Query(scope.TenantId, scope.CompanyId)
            .Where(category => category.Id == id)
            .Select(category => new CategoryResponse(
                category.Id,
                category.NameAr,
                category.NameEn,
                category.CategorySubcategories
                    .Where(link => link.TenantId == scope.TenantId &&
                                   link.CompanyId == scope.CompanyId &&
                                   link.SubCategory != null)
                    .Select(link => new SimpleSubCategoryResponse(
                        link.SubCategory!.Id,
                        link.SubCategory.NameAr,
                        link.SubCategory.NameEn,
                        link.SubCategory.IsDeleted))
                    .ToList(),
                category.CreatedOn,
                category.UpdatedOn,
                category.IsDeleted))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private IQueryable<Category> Query(string tenantId, int companyId) =>
        context.Categories.AsNoTracking()
            .Where(category => category.TenantId == tenantId && category.CompanyId == companyId);
}

public sealed class CategoryWriteStore(InventoryDbContext context, ICurrentActor currentActor) : ICategoryWriteStore
{
    public void Add(Category category) => context.Categories.Add(category);

    public Task<Category?> GetForUpdateAsync(int id, CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return context.Categories
            .FirstOrDefaultAsync(category =>
                category.Id == id &&
                category.TenantId == scope.TenantId &&
                category.CompanyId == scope.CompanyId,
                cancellationToken);
    }

    public Task<bool> HasActiveSubCategoriesAsync(int categoryId, CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return context.CategorySubcategories.AnyAsync(link =>
            link.CategoryId == categoryId &&
            link.TenantId == scope.TenantId &&
            link.CompanyId == scope.CompanyId &&
            link.SubCategory != null &&
            link.SubCategory.TenantId == scope.TenantId &&
            link.SubCategory.CompanyId == scope.CompanyId &&
            !link.SubCategory.IsDeleted,
            cancellationToken);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}

public sealed class CategoryEffects(
    ICurrentActor currentActor,
    HybridCache hybridCache,
    IRealtimeChangeDispatcher realtimeChanges) : ICategoryEffects
{
    private const string CacheKeyPrefix = "AvailableCategories";

    public Task InvalidateCacheAsync(CancellationToken cancellationToken) =>
        hybridCache.RemoveAsync(
            CompanyScopedCatalogCacheKey.Create(CacheKeyPrefix, currentActor),
            cancellationToken).AsTask();

    public void DispatchChange(string action, Category category)
    {
        if (string.IsNullOrWhiteSpace(category.TenantId) || category.CompanyId <= 0)
            throw new InvalidOperationException("A tenant and company are required for category realtime updates.");

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<Category>(
            RealtimeAudience.ForCompanyPermission(
                category.TenantId,
                category.CompanyId,
                InventoryPermissions.ViewCategories),
            action,
            category.Id.ToString(CultureInfo.InvariantCulture)));
    }
}
