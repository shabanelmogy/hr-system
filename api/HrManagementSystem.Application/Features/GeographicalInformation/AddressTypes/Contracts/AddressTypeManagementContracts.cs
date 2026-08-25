namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;

public abstract record AddressTypeMutation(string NameAr, string NameEn);
public sealed record CreateAddressTypeRequest(string NameAr, string NameEn) : AddressTypeMutation(NameAr, NameEn);
public sealed record UpdateAddressTypeRequest(string NameAr, string NameEn) : AddressTypeMutation(NameAr, NameEn);
public sealed record CreateAddressTypesRequest(IReadOnlyList<CreateAddressTypeRequest> AddressTypes);
public sealed record CreateAddressTypesResponse(int CreatedCount);
public sealed record BulkArchiveAddressTypesRequest(IReadOnlyList<int> Ids);
public sealed record BulkArchiveAddressTypesResponse(int ArchivedCount);
public sealed record AddressTypeListItemResponse(int Id, string NameAr, string NameEn, int AddressesCount, DateTime CreatedOn, DateTime? UpdatedOn, bool IsDeleted);
public sealed record AddressTypeDetailResponse(int Id, string NameAr, string NameEn, DateTime CreatedOn, DateTime? UpdatedOn, bool IsDeleted);
public sealed record AddressTypeLookupResponse(int Id, string NameAr, string NameEn);
public sealed record AddressTypeAddressListItem(int Id, string BuildingNumber, string Floor, string ApartmentNumber, string PostalCode, bool IsDefault, bool IsDeleted);
public sealed record AddressTypeWithAddressesResponse(int Id, string NameAr, string NameEn, IReadOnlyList<AddressTypeAddressListItem> Addresses, DateTime CreatedOn, DateTime? UpdatedOn, bool IsDeleted);
public sealed record AddressTypeChange(
    AddressTypeDetailResponse? AddressType,
    string Action,
    int? BulkCount,
    string? ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);
