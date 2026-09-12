using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;

public sealed record BulkArchiveCountriesCommand(IReadOnlyList<int> Ids)
    : ICommand<Result<BulkArchiveCountriesResponse>>;
