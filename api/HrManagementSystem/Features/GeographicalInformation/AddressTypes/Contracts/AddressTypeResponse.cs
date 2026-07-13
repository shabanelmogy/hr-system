namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;

public record AddressTypeResponse(
    int Id,
    string NameAr,
    string NameEn,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted
);
