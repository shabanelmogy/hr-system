namespace HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;

public record AddressResponse(
    int Id,
    int CountryId,
    int? StateId,
    int? DistrictId,
    string? City,
    string? StreetLine1,
    string? StreetLine2,
    string? BuildingNumber,
    string? Floor,
    string? ApartmentNumber,
    string? PostalCode,
    string? AdditionalInfo,
    double? Latitude,
    double? Longitude,
    int AddressTypeId,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted
);
