using ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Abstractions;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Catalog.Categories.Persistence;

public sealed class CategoryValidationQueries(ApplicationDbContext context)
    : ICategoryValidationQueries
{
    public Task<bool> CategoryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Categories.AnyAsync(
            category => category.NameAr == name &&
                        (!excludedId.HasValue || category.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> CategoryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Categories.AnyAsync(
            category => category.NameEn == name &&
                        (!excludedId.HasValue || category.Id != excludedId.Value),
            cancellationToken);

    public Task<int> CountActiveCategoriesAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken) =>
        context.Categories.CountAsync(
            category => ids.Contains(category.Id) && !category.IsDeleted,
            cancellationToken);
}
