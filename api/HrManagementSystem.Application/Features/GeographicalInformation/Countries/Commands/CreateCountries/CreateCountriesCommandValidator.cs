using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;

public sealed class CreateCountriesCommandValidator : AbstractValidator<CreateCountriesCommand>
{
    public CreateCountriesCommandValidator(IStringLocalizer<CreateCountryRequest> localizer)
    {
        RuleFor(command => command.Countries)
            .NotEmpty()
            .WithMessage(localizer[nameof(CountryErrors.NoCountriesProvided)]);

        RuleForEach(command => command.Countries)
            .SetValidator(new CountryMutationValidator<CreateCountryRequest>(localizer));
    }
}
