namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

public sealed record CountryDetailResponse(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);
