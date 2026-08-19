using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;

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
