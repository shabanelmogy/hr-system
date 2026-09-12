using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;

public sealed record UpdateCountryCommand(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode)
    : CountryMutation(NameAr, NameEn, Alpha2Code, Alpha3Code, PhoneCode, CurrencyCode),
      ICommand<Result<CountryDetailResponse>>;
