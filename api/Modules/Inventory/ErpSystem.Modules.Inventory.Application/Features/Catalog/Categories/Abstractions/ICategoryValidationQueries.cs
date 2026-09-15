using ErpSystem.BuildingBlocks.Application.Abstractions.Validation;

namespace ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;

public interface ICategoryValidationQueries : IValidationQuery
{
    Task<bool> CategoryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> CategoryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<int> CountActiveCategoriesAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken);
}
