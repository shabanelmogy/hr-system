using HrManagementSystem.Application.Abstractions.Messaging;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.ArchiveCountry;

public sealed record ArchiveCountryCommand(int Id) : ICommand<Result>;

public sealed class ArchiveCountryCommandValidator : AbstractValidator<ArchiveCountryCommand>
{
    public ArchiveCountryCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
    }
}
