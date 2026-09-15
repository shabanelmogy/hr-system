using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;

public sealed record RestoreCountryCommand(int Id) : ICommand<Result>;

public sealed class RestoreCountryCommandValidator : AbstractValidator<RestoreCountryCommand>
{
    public RestoreCountryCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
    }
}
