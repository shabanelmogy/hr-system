using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;

public sealed record CreateCountriesCommand(IReadOnlyList<CreateCountryRequest> Countries)
    : ICommand<Result<CreateCountriesResponse>>;
