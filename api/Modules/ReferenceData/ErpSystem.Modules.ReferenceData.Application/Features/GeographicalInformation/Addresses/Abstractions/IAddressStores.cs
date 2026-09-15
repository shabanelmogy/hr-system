using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;

public sealed record AddressLifecycleSnapshot(
    int AddressTypeId,
    int CountryId,
    int? StateId,
    int? DistrictId,
    bool IsDeleted);

public interface IAddressReadStore
{
    Task<IReadOnlyList<AddressResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<AddressResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<AddressResponse?> GetWithDetailsAsync(int id, CancellationToken cancellationToken);
    Task<int> CountActiveAsync(CancellationToken cancellationToken);
}

public interface IAddressWriteStore
{
    void Add(Address address);
    Task<AddressLifecycleSnapshot?> GetSnapshotAsync(int id, CancellationToken cancellationToken);
    Task<Address?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken);
    Task<bool> IsStateActiveInCountryAsync(int stateId, int countryId, CancellationToken cancellationToken);
    Task<bool> IsDistrictActiveInHierarchyAsync(
        int districtId,
        int? stateId,
        int countryId,
        CancellationToken cancellationToken);
    Task<bool> IsAddressTypeActiveAsync(int addressTypeId, CancellationToken cancellationToken);
    Task<bool> IsLinkedToOwnerAsync(int addressId, CancellationToken cancellationToken);
}

public interface IAddressAuditTrail
{
    Task RecordUpdateAsync(Address existingAddress, Address updatedAddress, CancellationToken cancellationToken);
}

public interface IAddressChangeScheduler
{
    void Schedule(AddressChange change);
}
