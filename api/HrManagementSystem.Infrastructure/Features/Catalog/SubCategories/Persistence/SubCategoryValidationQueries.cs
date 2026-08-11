using HrManagementSystem.Application.Features.Catalog.SubCategories.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Catalog.SubCategories.Persistence;

public sealed class SubCategoryValidationQueries(ApplicationDbContext context)
    : ISubCategoryValidationQueries
{
    public Task<bool> SubCategoryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.SubCategories.AnyAsync(
            subCategory => subCategory.NameAr == name &&
                           (!excludedId.HasValue || subCategory.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> SubCategoryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.SubCategories.AnyAsync(
            subCategory => subCategory.NameEn == name &&
                           (!excludedId.HasValue || subCategory.Id != excludedId.Value),
            cancellationToken);
}
