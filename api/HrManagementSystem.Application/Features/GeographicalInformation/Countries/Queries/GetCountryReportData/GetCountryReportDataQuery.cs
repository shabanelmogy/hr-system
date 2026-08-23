using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryReportData;

public sealed record GetCountryReportDataQuery
    : IQuery<IReadOnlyList<CountryReportDataResponse>>;

public sealed class GetCountryReportDataQueryHandler(ICountryReadStore readStore)
    : IQueryHandler<GetCountryReportDataQuery, IReadOnlyList<CountryReportDataResponse>>
{
    public Task<IReadOnlyList<CountryReportDataResponse>> Handle(
        GetCountryReportDataQuery request,
        CancellationToken cancellationToken) =>
        readStore.GetReportDataAsync(cancellationToken);
}
