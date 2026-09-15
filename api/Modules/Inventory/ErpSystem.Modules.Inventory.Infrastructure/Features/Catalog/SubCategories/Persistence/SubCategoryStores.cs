using System.Linq.Expressions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog;

namespace ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.SubCategories.Persistence;

public sealed class SubCategoryReadStore(
    InventoryDbContext context,
    ICurrentActor currentActor,
    HybridCache hybridCache) : ISubCategoryReadStore
{
    private const string CacheKeyPrefix = "AvailableSubcategories";

    public async Task<IReadOnlyList<SubCategoryResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return await hybridCache.GetOrCreateAsync<IReadOnlyList<SubCategoryResponse>>(
            CompanyScopedCatalogCacheKey.Create(CacheKeyPrefix, currentActor),
            async _ => await Query(scope.TenantId, scope.CompanyId)
                .Where(subCategory => !subCategory.IsDeleted)
                .Select(Project(scope.TenantId, scope.CompanyId))
                .ToListAsync(cancellationToken),
            cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<SubCategoryResponse>> GetByCategoryIdAsync(
        int categoryId,
        CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return await Query(scope.TenantId, scope.CompanyId)
            .Where(subCategory => subCategory.CategorySubcategories.Any(link =>
                link.TenantId == scope.TenantId &&
                link.CompanyId == scope.CompanyId &&
                link.CategoryId == categoryId))
            .Select(Project(scope.TenantId, scope.CompanyId))
            .ToListAsync(cancellationToken);
    }

    public Task<SubCategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return Query(scope.TenantId, scope.CompanyId)
            .Where(subCategory => subCategory.Id == id)
            .Select(Project(scope.TenantId, scope.CompanyId))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private IQueryable<SubCategory> Query(string tenantId, int companyId) =>
        context.SubCategories.AsNoTracking()
            .Where(subCategory => subCategory.TenantId == tenantId && subCategory.CompanyId == companyId);

    private static Expression<Func<SubCategory, SubCategoryResponse>> Project(string tenantId, int companyId) =>
        subCategory => new SubCategoryResponse(
            subCategory.Id,
            subCategory.NameAr,
            subCategory.NameEn,
            subCategory.CreatedOn,
            subCategory.UpdatedOn,
            subCategory.IsDeleted,
            subCategory.CategorySubcategories
                .Where(link => link.TenantId == tenantId && link.CompanyId == companyId && link.Category != null)
                .Select(link => new SimpleCategoryResponse(
                    link.Category!.Id,
                    link.Category.NameAr,
                    link.Category.NameEn,
                    link.Category.IsDeleted))
                .ToList());
}

public sealed class SubCategoryWriteStore(InventoryDbContext context, ICurrentActor currentActor) : ISubCategoryWriteStore
{
    public void Add(SubCategory subCategory) => context.SubCategories.Add(subCategory);

    public Task<SubCategory?> GetForUpdateAsync(int id, CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        return context.SubCategories
            .Include(subCategory => subCategory.CategorySubcategories)
            .FirstOrDefaultAsync(subCategory =>
                subCategory.Id == id &&
                subCategory.TenantId == scope.TenantId &&
                subCategory.CompanyId == scope.CompanyId,
                cancellationToken);
    }

    public async Task ReplaceCategoryLinksAsync(
        SubCategory subCategory,
        IReadOnlyCollection<int> categoryIds,
        CancellationToken cancellationToken)
    {
        var scope = CatalogScope.Require(currentActor);
        var existing = await context.CategorySubcategories
            .Where(link =>
                link.SubCategoryId == subCategory.Id &&
                link.TenantId == scope.TenantId &&
                link.CompanyId == scope.CompanyId)
            .ToListAsync(cancellationToken);
        if (existing.Count != 0)
            context.CategorySubcategories.RemoveRange(existing);

        var links = categoryIds.Select(categoryId => new CategorySubcategory
        {
            SubCategoryId = subCategory.Id,
            CategoryId = categoryId,
            TenantId = scope.TenantId,
            CompanyId = scope.CompanyId
        }).ToList();
        subCategory.CategorySubcategories = links;
        context.CategorySubcategories.AddRange(links);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}

public sealed class SubCategoryEffects(
    ICurrentActor currentActor,
    HybridCache hybridCache,
    IRealtimeChangeDispatcher realtimeChanges) : ISubCategoryEffects
{
    private const string CacheKeyPrefix = "AvailableSubcategories";

    public Task InvalidateCacheAsync(CancellationToken cancellationToken) =>
        hybridCache.RemoveAsync(
            CompanyScopedCatalogCacheKey.Create(CacheKeyPrefix, currentActor),
            cancellationToken).AsTask();

    public void DispatchChange(string action, SubCategory subCategory)
    {
        if (string.IsNullOrWhiteSpace(subCategory.TenantId) || subCategory.CompanyId <= 0)
            throw new InvalidOperationException("A tenant and company are required for subcategory realtime updates.");

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<SubCategory>(
            RealtimeAudience.ForCompanyPermission(
                subCategory.TenantId,
                subCategory.CompanyId,
                InventoryPermissions.ViewSubCategories),
            action,
            subCategory.Id.ToString(CultureInfo.InvariantCulture)));
    }
}
