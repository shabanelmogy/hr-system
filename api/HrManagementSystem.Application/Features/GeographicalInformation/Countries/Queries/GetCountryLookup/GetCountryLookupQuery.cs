using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryLookup;

public sealed record GetCountryLookupQuery : IQuery<IReadOnlyList<SimpleCountryResponse>>;

public sealed class GetCountryLookupQueryHandler(ICountryReadStore countryReadStore)
    : IQueryHandler<GetCountryLookupQuery, IReadOnlyList<SimpleCountryResponse>>
{
    public Task<IReadOnlyList<SimpleCountryResponse>> Handle(
        GetCountryLookupQuery request,
        CancellationToken cancellationToken) =>
        countryReadStore.GetLookupAsync(cancellationToken);
}
