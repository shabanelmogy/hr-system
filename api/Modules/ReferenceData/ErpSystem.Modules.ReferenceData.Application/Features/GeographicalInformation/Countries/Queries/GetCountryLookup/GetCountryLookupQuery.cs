using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountryLookup;

public sealed record GetCountryLookupQuery : IQuery<IReadOnlyList<SimpleCountryResponse>>;

public sealed class GetCountryLookupQueryHandler(ICountryReadStore countryReadStore)
    : IQueryHandler<GetCountryLookupQuery, IReadOnlyList<SimpleCountryResponse>>
{
    public Task<IReadOnlyList<SimpleCountryResponse>> Handle(
        GetCountryLookupQuery request,
        CancellationToken cancellationToken) =>
        countryReadStore.GetLookupAsync(cancellationToken);
}
