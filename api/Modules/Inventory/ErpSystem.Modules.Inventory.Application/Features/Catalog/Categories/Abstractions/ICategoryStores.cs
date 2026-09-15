using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Contracts;
using ErpSystem.Modules.Inventory.Domain.Catalog.Categories.Entities;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;

public interface ICategoryReadStore
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<CategoryResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface ICategoryWriteStore
{
    void Add(Category category);
    Task<Category?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> HasActiveSubCategoriesAsync(int categoryId, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface ICategoryEffects
{
    Task InvalidateCacheAsync(CancellationToken cancellationToken);
    void DispatchChange(string action, Category category);
}
