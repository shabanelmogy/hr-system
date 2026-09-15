using ErpSystem.Modules.Platform.Contracts.CompanyAccess;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Tenancy;

internal sealed class PlatformCompanyGeographySource(PlatformDbContext context) : ICompanyGeographySource
{
    public async Task<bool> HasCompanyUsageAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken = default) =>
        await context.Companies.IgnoreQueryFilters().AsNoTracking()
            .AnyAsync(company => company.RegistrationCountryId.HasValue &&
                                 countryIds.Contains(company.RegistrationCountryId.Value), cancellationToken)
        || await context.CompanyCountries.IgnoreQueryFilters().AsNoTracking()
            .AnyAsync(link => !link.IsDeleted && countryIds.Contains(link.CountryId), cancellationToken);

    public Task<bool> IsCountryInScopeAsync(
        string tenantId,
        int companyId,
        int countryId,
        CancellationToken cancellationToken = default) =>
        context.CompanyCountries.IgnoreQueryFilters().AsNoTracking().AnyAsync(link =>
            link.TenantId == tenantId && link.CompanyId == companyId && link.CountryId == countryId && !link.IsDeleted,
            cancellationToken);
}
