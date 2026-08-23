using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryReadStore
{
    Task<PageResponse<CountryListItemResponse>> GetPageAsync(
        GetCountriesQuery query,
        CancellationToken cancellationToken);

    Task<CountryDetailResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<CountryResponse?> GetWithStatesByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<SimpleCountryResponse>> GetLookupAsync(
        CancellationToken cancellationToken);

    Task<IReadOnlyList<CountryReportDataResponse>> GetReportDataAsync(
        CancellationToken cancellationToken);
}
