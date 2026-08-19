using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;

public sealed record GetCountryByIdQuery(int Id) : IQuery<Result<CountryDetailResponse>>;

public sealed class GetCountryByIdQueryValidator : AbstractValidator<GetCountryByIdQuery>
{
    public GetCountryByIdQueryValidator()
    {
        RuleFor(query => query.Id).GreaterThan(0);
    }
}
