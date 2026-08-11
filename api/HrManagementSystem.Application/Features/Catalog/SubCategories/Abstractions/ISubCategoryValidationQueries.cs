using HrManagementSystem.Application.Abstractions.Validation;

namespace HrManagementSystem.Application.Features.Catalog.SubCategories.Abstractions;

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
