namespace ErpSystem.Modules.Platform.Contracts.CompanyAccess;

/// <summary>Read-only platform-owned company geography queries consumed by reference data.</summary>
public interface ICompanyGeographySource
{
    Task<bool> HasCompanyUsageAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken = default);

    Task<bool> IsCountryInScopeAsync(
        string tenantId,
        int companyId,
        int countryId,
        CancellationToken cancellationToken = default);
}
