using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;

public sealed class CreateCountriesCommandValidator : AbstractValidator<CreateCountriesCommand>
{
    public const int MaximumBatchSize = 100;

    public CreateCountriesCommandValidator(IStringLocalizer<CreateCountryRequest> localizer)
    {
        RuleFor(command => command.Countries)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage(localizer[nameof(CountryErrors.NoCountriesProvided)])
            .Must(countries => countries.Count <= MaximumBatchSize)
            .WithMessage(localizer["CountryBatchLimitExceeded"]);

        RuleForEach(command => command.Countries)
            .SetValidator(new CountryMutationValidator<CreateCountryRequest>(localizer));
    }
}
