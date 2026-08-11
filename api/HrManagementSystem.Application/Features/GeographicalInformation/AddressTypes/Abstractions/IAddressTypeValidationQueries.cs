using HrManagementSystem.Application.Abstractions.Validation;

namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;

public interface IAddressTypeValidationQueries : IValidationQuery
{
    Task<bool> AddressTypeNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> AddressTypeNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> AddressTypeExistsAsync(int id, CancellationToken cancellationToken);
}
