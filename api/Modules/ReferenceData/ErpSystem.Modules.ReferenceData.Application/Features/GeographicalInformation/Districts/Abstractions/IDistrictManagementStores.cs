using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Queries;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Abstractions;

public interface IDistrictReadStore
{
    Task<PageResponse<DistrictListItemResponse>> GetPageAsync(GetDistrictsQuery query, CancellationToken cancellationToken);
    Task<DistrictDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<DistrictWithAddressesResponse?> GetWithAddressesByIdAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<DistrictLookupResponse>> GetLookupAsync(int? stateId, CancellationToken cancellationToken);
}

public interface IDistrictWriteStore
{
    void Add(District district);
    void AddRange(IReadOnlyCollection<District> districts);
    Task<District?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<District>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken);
    Task<int?> GetStateIdAsync(int districtId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<int, int>> GetStateIdsAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken);
    Task<bool> IsStateActiveAsync(int stateId, CancellationToken cancellationToken);
    Task<bool> AreStatesActiveAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken);
    Task<bool> HasConflictAsync(District candidate, int? excludedId, CancellationToken cancellationToken);
    Task<bool> HasAnyConflictAsync(IReadOnlyCollection<District> districts, CancellationToken cancellationToken);
    Task<bool> HasActiveAddressesAsync(int districtId, CancellationToken cancellationToken);
    Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken);
}

public interface IDistrictChangeScheduler
{
    void Schedule(DistrictChange change);
}

public interface IDistrictAuditTrail
{
    Task RecordUpdateAsync(District existingDistrict, District updatedDistrict, CancellationToken cancellationToken);
}
