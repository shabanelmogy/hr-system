namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;

public record AddressTypeRequest(
    int Id,
    string NameAr,
    string NameEn
);
