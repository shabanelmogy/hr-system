using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Services;

public interface IAddressService
{
    Task<IEnumerable<AddressResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<AddressResponse>>? GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<AddressResponse>>? GetWithRelatedEntities(int id, CancellationToken cancellationToken = default);
    Task<Result<AddressResponse>> AddAsync(AddressRequest address, CancellationToken cancellationToken = default);
    Task<Result<AddressResponse>> UpdateAsync(AddressRequest addressRequest, CancellationToken cancellationToken = default);
    Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<AddressesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default);
}