using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.States.Contracts;

public record StateResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    SimpleCountryResponse Country,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted
);