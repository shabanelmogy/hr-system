using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;

public sealed record CreateCountryCommand(
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode)
    : CountryMutation(NameAr, NameEn, Alpha2Code, Alpha3Code, PhoneCode, CurrencyCode),
      ICommand<Result<CountryDetailResponse>>;
