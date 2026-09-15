using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;

public sealed class CreateCountryCommandValidator
    : CountryMutationValidator<CreateCountryCommand>
{
    public CreateCountryCommandValidator(
        IStringLocalizer<CreateCountryRequest> localizer)
        : base(localizer)
    {
    }
}
