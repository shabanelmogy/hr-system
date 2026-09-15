using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Errors;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountryWithStates;

public sealed class GetCountryWithStatesQueryHandler(
    ICountryReadStore countryReadStore,
    CountryErrors countryErrors)
    : IQueryHandler<GetCountryWithStatesQuery, Result<CountryResponse>>
{
    public async Task<Result<CountryResponse>> Handle(
        GetCountryWithStatesQuery request,
        CancellationToken cancellationToken)
    {
        var country = await countryReadStore.GetWithStatesByIdAsync(
            request.Id,
            cancellationToken);
        return country is null
            ? Result.Failure<CountryResponse>(countryErrors.CountryNotFound)
            : Result.Success(country);
    }
}
