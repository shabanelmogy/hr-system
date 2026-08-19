using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;

public sealed record CreateCountriesCommand(IReadOnlyList<CreateCountryRequest> Countries)
    : ICommand<Result<CreateCountriesResponse>>;
