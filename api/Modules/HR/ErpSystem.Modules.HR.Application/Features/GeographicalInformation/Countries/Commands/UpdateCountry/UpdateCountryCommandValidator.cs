using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;

public sealed class UpdateCountryCommandValidator
    : CountryMutationValidator<UpdateCountryCommand>
{
    public UpdateCountryCommandValidator(
        IStringLocalizer<CreateCountryRequest> localizer)
        : base(localizer)
    {
        RuleFor(command => command.Id).GreaterThan(0);
    }
}
