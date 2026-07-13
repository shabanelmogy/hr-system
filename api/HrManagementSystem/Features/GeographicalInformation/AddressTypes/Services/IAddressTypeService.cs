using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Services;

public interface IAddressTypeService
{
    Task<IEnumerable<AddressTypeResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<AddressTypeResponse>> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<AddressTypeResponse>> GetRelatedAddresses(int id, CancellationToken cancellationToken = default);
    Task<Result<AddressTypeResponse>> AddAsync(AddressTypeRequest addressType, CancellationToken cancellationToken = default);
    Task<Result<AddressTypeResponse>> UpdateAsync(AddressTypeRequest addressTypeRequest, CancellationToken cancellationToken = default);
    Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<AddressTypesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default);
}
