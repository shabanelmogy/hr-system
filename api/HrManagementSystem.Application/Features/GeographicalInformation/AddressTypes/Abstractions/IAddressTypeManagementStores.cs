using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Queries;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;

namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;

public interface IAddressTypeReadStore
{
    Task<PageResponse<AddressTypeListItemResponse>> GetPageAsync(GetAddressTypesQuery query, CancellationToken cancellationToken);
    Task<AddressTypeDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<AddressTypeWithAddressesResponse?> GetWithAddressesByIdAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<AddressTypeLookupResponse>> GetLookupAsync(CancellationToken cancellationToken);
}
public interface IAddressTypeWriteStore
{
    void Add(AddressType addressType);
    void AddRange(IReadOnlyCollection<AddressType> addressTypes);
    Task<AddressType?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<AddressType>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken);
    Task<bool> HasConflictAsync(AddressType candidate, int? excludedId, CancellationToken cancellationToken);
    Task<bool> HasAnyConflictAsync(IReadOnlyCollection<AddressType> addressTypes, int? excludedId, CancellationToken cancellationToken);
    Task<bool> HasActiveAddressesAsync(int addressTypeId, CancellationToken cancellationToken);
    Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> addressTypeIds, CancellationToken cancellationToken);
}
public interface IAddressTypeChangeScheduler { void Schedule(AddressTypeChange change); }
public interface IAddressTypeAuditTrail { void RecordUpdate(AddressType existingAddressType, AddressType updatedAddressType); }
