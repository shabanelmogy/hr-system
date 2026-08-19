namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

public sealed record CountryListItemResponse(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode,
    int StatesCount,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted);
