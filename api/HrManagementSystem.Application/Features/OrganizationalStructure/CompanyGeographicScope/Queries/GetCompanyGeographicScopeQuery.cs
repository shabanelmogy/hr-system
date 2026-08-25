using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Queries;

public sealed record GetCompanyGeographicScopeQuery
    : IQuery<Result<CompanyGeographicScopeResponse>>;

public sealed class GetCompanyGeographicScopeQueryHandler(
    ICompanyGeographicScopeStore store,
    ICurrentActor currentActor,
    CompanyGeographicScopeErrors errors)
    : IQueryHandler<GetCompanyGeographicScopeQuery, Result<CompanyGeographicScopeResponse>>
{
    public async Task<Result<CompanyGeographicScopeResponse>> Handle(
        GetCompanyGeographicScopeQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentActor.CompanyId.HasValue)
            return Result.Failure<CompanyGeographicScopeResponse>(errors.CompanyContextRequired);

        return Result.Success(await store.GetAsync(currentActor.CompanyId.Value, cancellationToken));
    }
}
