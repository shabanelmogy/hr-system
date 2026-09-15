using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountryWithStates;

public sealed record GetCountryWithStatesQuery(int Id) : IQuery<Result<CountryResponse>>;

public sealed class GetCountryWithStatesQueryValidator : AbstractValidator<GetCountryWithStatesQuery>
{
    public GetCountryWithStatesQueryValidator()
    {
        RuleFor(query => query.Id).GreaterThan(0);
    }
}
