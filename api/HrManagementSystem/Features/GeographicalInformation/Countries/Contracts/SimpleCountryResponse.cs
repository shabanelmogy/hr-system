namespace HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;

public record SimpleCountryResponse(
    int Id,
    string NameAr,
    string NameEn,
    bool IsDeleted
    );