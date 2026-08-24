using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

public abstract record StateMutation(
    string NameAr,
    string NameEn,
    string Code,
    int CountryId);

public sealed record CreateStateRequest(
    string NameAr,
    string NameEn,
    string Code,
    int CountryId)
    : StateMutation(NameAr, NameEn, Code, CountryId);

public sealed record UpdateStateRequest(
    string NameAr,
    string NameEn,
    string Code,
    int CountryId)
    : StateMutation(NameAr, NameEn, Code, CountryId);

public sealed record CreateStatesRequest(IReadOnlyList<CreateStateRequest> States);

public sealed record CreateStatesResponse(int CreatedCount);

public sealed record BulkArchiveStatesRequest(IReadOnlyList<int> Ids);

public sealed record BulkArchiveStatesResponse(int ArchivedCount);

public sealed record StateListItemResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int CountryId,
    SimpleCountryResponse Country,
    int DistrictsCount,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);

public sealed record StateDetailResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int CountryId,
    SimpleCountryResponse Country,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);

public sealed record StateDistrictListItem(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    bool IsDeleted);

public sealed record StateWithDistrictsResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int CountryId,
    SimpleCountryResponse Country,
    IReadOnlyList<StateDistrictListItem> Districts,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);

public sealed record StateLookupResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int CountryId);

public sealed record StateChange(
    StateDetailResponse? State,
    string Action,
    int? BulkCount,
    string? ActorUserId,
    Guid OperationId);
