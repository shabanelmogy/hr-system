namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

public abstract record CountryMutation(
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode);

public sealed record CreateCountryRequest(
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode)
    : CountryMutation(NameAr, NameEn, Alpha2Code, Alpha3Code, PhoneCode, CurrencyCode);

public sealed record UpdateCountryRequest(
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode)
    : CountryMutation(NameAr, NameEn, Alpha2Code, Alpha3Code, PhoneCode, CurrencyCode);

public sealed record CreateCountriesRequest(IReadOnlyList<CreateCountryRequest> Countries);

public sealed record CreateCountriesResponse(int CreatedCount);

public sealed record BulkArchiveCountriesRequest(IReadOnlyList<int> Ids);

public sealed record BulkArchiveCountriesResponse(int ArchivedCount);
