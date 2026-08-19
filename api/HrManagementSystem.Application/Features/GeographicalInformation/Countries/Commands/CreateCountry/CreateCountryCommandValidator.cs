using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;

public sealed class CreateCountryCommandValidator
    : CountryMutationValidator<CreateCountryCommand>
{
    public CreateCountryCommandValidator(
        IStringLocalizer<CreateCountryRequest> localizer)
        : base(localizer)
    {
    }
}
