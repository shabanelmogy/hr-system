using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Errors;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;

public sealed class GetCountryByIdQueryHandler(
    ICountryReadStore countryReadStore,
    CountryErrors countryErrors)
    : IQueryHandler<GetCountryByIdQuery, Result<CountryDetailResponse>>
{
    public async Task<Result<CountryDetailResponse>> Handle(
        GetCountryByIdQuery request,
        CancellationToken cancellationToken)
    {
        var country = await countryReadStore.GetByIdAsync(
            request.Id,
            cancellationToken);

        return country is null
            ? Result.Failure<CountryDetailResponse>(countryErrors.CountryNotFound)
            : Result.Success(country);
    }
}
