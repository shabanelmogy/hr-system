using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;

public abstract record DistrictMutation(
    string NameAr,
    string NameEn,
    string Code,
    int StateId);

public sealed record CreateDistrictRequest(
    string NameAr,
    string NameEn,
    string Code,
    int StateId)
    : DistrictMutation(NameAr, NameEn, Code, StateId);

public sealed record UpdateDistrictRequest(
    string NameAr,
    string NameEn,
    string Code,
    int StateId)
    : DistrictMutation(NameAr, NameEn, Code, StateId);

public sealed record CreateDistrictsRequest(IReadOnlyList<CreateDistrictRequest> Districts);

public sealed record CreateDistrictsResponse(int CreatedCount);

public sealed record BulkArchiveDistrictsRequest(IReadOnlyList<int> Ids);

public sealed record BulkArchiveDistrictsResponse(int ArchivedCount);

public sealed record DistrictListItemResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int StateId,
    SimpleStateResponse State,
    int AddressesCount,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);

public sealed record DistrictDetailResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int StateId,
    SimpleStateResponse State,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);

public sealed record DistrictAddressListItem(
    int Id,
    string BuildingNumber,
    string Floor,
    string ApartmentNumber,
    string PostalCode,
    bool IsDefault,
    bool IsDeleted);

public sealed record DistrictWithAddressesResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int StateId,
    SimpleStateResponse State,
    IReadOnlyList<DistrictAddressListItem> Addresses,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);

public sealed record DistrictLookupResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int StateId);

public sealed record DistrictChange(
    DistrictDetailResponse? District,
    string Action,
    int? BulkCount,
    string? ActorUserId,
    Guid OperationId);
