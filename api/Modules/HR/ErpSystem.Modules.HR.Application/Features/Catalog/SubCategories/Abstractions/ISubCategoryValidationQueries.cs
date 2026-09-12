using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.Catalog.SubCategories.Abstractions;

public interface ISubCategoryValidationQueries : IValidationQuery
{
    Task<bool> SubCategoryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> SubCategoryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);
}
