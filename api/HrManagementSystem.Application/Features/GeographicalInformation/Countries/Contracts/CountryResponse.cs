using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

public record CountryResponse(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode,
    List<SimpleStateResponse> States,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted
);
