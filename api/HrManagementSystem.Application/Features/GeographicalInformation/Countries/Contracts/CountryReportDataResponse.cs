namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

public sealed record CountryReportDataResponse(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode,
    bool IsActive);
