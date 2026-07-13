namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;

public record AddressRequest(
    int Id,
    string BuildingNumber,
    string Floor,
    string ApartmentNumber,
    string PostalCode,
    string AdditionalInfo,
    double Latitude,
    double Longitude,
    bool IsDefault,
    int AddressTypeId,
    int DistrictId
);
