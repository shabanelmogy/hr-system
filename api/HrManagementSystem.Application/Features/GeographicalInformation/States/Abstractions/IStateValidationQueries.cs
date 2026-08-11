using HrManagementSystem.Application.Abstractions.Validation;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;

public interface IStateValidationQueries : IValidationQuery
{
    Task<bool> StateNameEnExistsAsync(
        string name,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> StateNameArExistsAsync(
        string name,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> StateCodeExistsAsync(
        string code,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> StateExistsAsync(int id, CancellationToken cancellationToken);
}
