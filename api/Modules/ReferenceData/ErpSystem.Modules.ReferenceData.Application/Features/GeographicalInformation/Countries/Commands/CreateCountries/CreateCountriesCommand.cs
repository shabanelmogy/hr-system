using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;

public sealed record CreateCountriesCommand(IReadOnlyList<CreateCountryRequest> Countries)
    : ICommand<Result<CreateCountriesResponse>>;
