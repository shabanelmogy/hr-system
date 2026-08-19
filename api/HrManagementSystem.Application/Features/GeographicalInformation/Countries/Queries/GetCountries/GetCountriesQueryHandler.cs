using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;

public sealed class GetCountriesQueryHandler(ICountryReadStore countryReadStore)
    : IQueryHandler<GetCountriesQuery, PageResponse<CountryListItemResponse>>
{
    public Task<PageResponse<CountryListItemResponse>> Handle(
        GetCountriesQuery request,
        CancellationToken cancellationToken) =>
        countryReadStore.GetPageAsync(request, cancellationToken);
}
