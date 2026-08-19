using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;

public class CountryErrors(IStringLocalizer<CreateCountryRequest> localizer)
{
    private readonly IStringLocalizer<CreateCountryRequest> _localizer = localizer;

    public Error CountryExists =>
            new("Country.Duplicated", _localizer[nameof(CountryExists)], ErrorType.Conflict);

    public Error CountryNotFound =>
            new("Country.CountryNotFound", _localizer[nameof(CountryNotFound)], ErrorType.NotFound);

    public Error CountryInUseByState =>
            new("Country.CountryInUseByState", _localizer[nameof(CountryInUseByState)], ErrorType.Validation);

    public Error NoCountriesProvided =>
            new("Country.NoCountriesProvided", _localizer[nameof(NoCountriesProvided)], ErrorType.Validation);
}
