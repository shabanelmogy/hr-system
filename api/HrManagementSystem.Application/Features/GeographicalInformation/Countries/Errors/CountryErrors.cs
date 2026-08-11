using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;

public class CountryErrors(IStringLocalizer<CountryRequest> localizer)
{
    private readonly IStringLocalizer<CountryRequest> _localizer = localizer;

    public Error CountryExists =>
            new("Country.Duplicated", _localizer[nameof(CountryExists)], ErrorType.Conflict);

    public Error CountryNotFound =>
            new("Country.CountryNotFound", _localizer[nameof(CountryNotFound)], ErrorType.NotFound);

    public Error CountryError =>
            new("Country.CountryError", _localizer[nameof(CountryError)], ErrorType.Unexpected);

    public Error CountryInUseByState =>
            new("Country.CountryInUseByState", _localizer[nameof(CountryInUseByState)], ErrorType.Validation);

    public Error InvalidCountryId =>
            new("Country.InvalidCountryId", _localizer[nameof(InvalidCountryId)], ErrorType.Validation);

    public Error NoCountriesProvided =>
            new("Country.NoCountriesProvided", _localizer[nameof(NoCountriesProvided)], ErrorType.Validation);

    public Error CountriesInOtherTables =>
            new("Country.CountriesInStates", _localizer[nameof(CountriesInOtherTables)], ErrorType.Validation);
}
