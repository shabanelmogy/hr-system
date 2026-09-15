using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;

public sealed class GetCountriesQueryHandler(ICountryReadStore countryReadStore)
    : IQueryHandler<GetCountriesQuery, PageResponse<CountryListItemResponse>>
{
    public Task<PageResponse<CountryListItemResponse>> Handle(
        GetCountriesQuery request,
        CancellationToken cancellationToken) =>
        countryReadStore.GetPageAsync(request, cancellationToken);
}
