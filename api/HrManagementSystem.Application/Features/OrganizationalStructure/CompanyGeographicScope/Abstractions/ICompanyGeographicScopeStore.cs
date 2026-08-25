using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;

public interface ICompanyGeographicScopeStore
{
    Task<CompanyGeographicScopeResponse> GetAsync(int companyId, CancellationToken cancellationToken);

    Task<bool> AreActiveCountriesAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken);

    Task ClearDefaultAsync(int companyId, CancellationToken cancellationToken);

    Task ReplaceAsync(
        int companyId,
        IReadOnlyCollection<int> countryIds,
        int defaultCountryId,
        CancellationToken cancellationToken);
}
