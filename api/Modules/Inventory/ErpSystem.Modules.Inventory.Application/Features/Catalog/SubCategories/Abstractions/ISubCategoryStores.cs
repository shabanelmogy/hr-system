using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Contracts;
using ErpSystem.Modules.Inventory.Domain.Catalog.SubCategories.Entities;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;

public interface ISubCategoryReadStore
{
    Task<IReadOnlyList<SubCategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<SubCategoryResponse>> GetByCategoryIdAsync(int categoryId, CancellationToken cancellationToken);
    Task<SubCategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface ISubCategoryWriteStore
{
    void Add(SubCategory subCategory);
    Task<SubCategory?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task ReplaceCategoryLinksAsync(SubCategory subCategory, IReadOnlyCollection<int> categoryIds, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface ISubCategoryEffects
{
    Task InvalidateCacheAsync(CancellationToken cancellationToken);
    void DispatchChange(string action, SubCategory subCategory);
}
