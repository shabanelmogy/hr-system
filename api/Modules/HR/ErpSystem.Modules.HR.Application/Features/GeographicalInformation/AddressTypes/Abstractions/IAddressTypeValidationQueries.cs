using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Abstractions;

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
