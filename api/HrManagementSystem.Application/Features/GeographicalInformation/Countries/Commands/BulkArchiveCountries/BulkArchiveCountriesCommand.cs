using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;

public sealed record BulkArchiveCountriesCommand(IReadOnlyList<int> Ids)
    : ICommand<Result<BulkArchiveCountriesResponse>>;
