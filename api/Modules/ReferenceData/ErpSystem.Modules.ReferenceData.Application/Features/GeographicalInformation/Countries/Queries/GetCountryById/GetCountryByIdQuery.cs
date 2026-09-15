using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;

public sealed record GetCountryByIdQuery(int Id) : IQuery<Result<CountryDetailResponse>>;

public sealed class GetCountryByIdQueryValidator : AbstractValidator<GetCountryByIdQuery>
{
    public GetCountryByIdQueryValidator()
    {
        RuleFor(query => query.Id).GreaterThan(0);
    }
}
