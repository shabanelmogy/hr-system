using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;

namespace ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.CompanyGeographicScope.Queries;

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
