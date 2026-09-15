using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;

public sealed record BulkArchiveCountriesCommand(IReadOnlyList<int> Ids)
    : ICommand<Result<BulkArchiveCountriesResponse>>;
