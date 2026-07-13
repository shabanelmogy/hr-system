using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.Countries.Errors;

public class CountryErrors(IStringLocalizer<CountryRequest> localizer)
{
    private readonly IStringLocalizer<CountryRequest> _localizer = localizer;

    public Error CountryExists =>
            new("Country.Duplicated", _localizer[nameof(CountryExists)], StatusCodes.Status409Conflict);

    public Error CountryNotFound =>
            new("Country.CountryNotFound", _localizer[nameof(CountryNotFound)], StatusCodes.Status404NotFound);

    public Error CountryError =>
            new("Country.CountryError", _localizer[nameof(CountryError)], StatusCodes.Status500InternalServerError);

    public Error CountryInUseByState =>
            new("Country.CountryInUseByState", _localizer[nameof(CountryInUseByState)], StatusCodes.Status400BadRequest);

    public Error InvalidCountryId =>
            new("Country.InvalidCountryId", _localizer[nameof(InvalidCountryId)], StatusCodes.Status400BadRequest);

    public Error NoCountriesProvided =>
            new("Country.NoCountriesProvided", _localizer[nameof(NoCountriesProvided)], StatusCodes.Status400BadRequest);

    public Error CountriesInOtherTables =>
            new("Country.CountriesInStates", _localizer[nameof(CountriesInOtherTables)], StatusCodes.Status400BadRequest);
}
