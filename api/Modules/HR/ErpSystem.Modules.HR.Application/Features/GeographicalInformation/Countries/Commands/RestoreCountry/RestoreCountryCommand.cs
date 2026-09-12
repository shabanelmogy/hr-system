using ErpSystem.Modules.HR.Application.Abstractions.Messaging;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;

public sealed record RestoreCountryCommand(int Id) : ICommand<Result>;

public sealed class RestoreCountryCommandValidator : AbstractValidator<RestoreCountryCommand>
{
    public RestoreCountryCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
    }
}
