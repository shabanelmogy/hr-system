namespace HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;

public record CountryRequest(
    int? Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode
);
