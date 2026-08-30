using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using Mapster;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Mapping;

public sealed class CountryMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<CountryMutation, Country>()
            .Map(destination => destination.NameAr, source => GeographicalNameRules.Normalize(source.NameAr))
            .Map(destination => destination.NameEn, source => GeographicalNameRules.Normalize(source.NameEn))
            .Map(destination => destination.Alpha2Code, source => NormalizeUpper(source.Alpha2Code))
            .Map(destination => destination.Alpha3Code, source => NormalizeUpper(source.Alpha3Code))
            .Map(destination => destination.PhoneCode, source => NormalizeOptional(source.PhoneCode))
            .Map(destination => destination.CurrencyCode, source => NormalizeUpper(source.CurrencyCode));

        config.NewConfig<Country, CountryListItemResponse>()
            .Map(
                destination => destination.StatesCount,
                source => source.States.Count(state => !state.IsDeleted));

        config.NewConfig<Country, CountryResponse>()
            .Map(
                destination => destination.States,
                source => source.States
                    .Where(state => !state.IsDeleted)
                    .OrderBy(state => state.NameEn)
                    .ThenBy(state => state.Id));
    }

    private static string? NormalizeUpper(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim().ToUpperInvariant();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
}
