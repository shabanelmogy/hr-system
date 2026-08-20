using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;

public sealed class BulkArchiveCountriesCommandValidator
    : AbstractValidator<BulkArchiveCountriesCommand>
{
    public const int MaximumBatchSize = 100;

    public BulkArchiveCountriesCommandValidator(IStringLocalizer<CreateCountryRequest> localizer)
    {
        RuleFor(command => command.Ids)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage(localizer[nameof(CountryErrors.NoCountriesProvided)])
            .Must(ids => ids.Count <= MaximumBatchSize)
            .WithMessage(localizer["CountryBatchLimitExceeded"])
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage(localizer["CountryIdsMustBeDistinct"]);

        RuleForEach(command => command.Ids)
            .GreaterThan(0)
            .WithMessage(localizer["CountryIdsMustBePositive"]);
    }
}
