using ErpSystem.Modules.Platform.Application.Features.CompanyGeography;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.ReferenceData.Contracts.CompanyGeography;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Tenancy;

internal sealed class PlatformCompanyGeographicScopeStore(
    PlatformDbContext context,
    IReferenceDataCompanyGeographySource referenceData,
    ICurrentActor actor) : ICompanyGeographicScopeStore
{
    public async Task<CompanyGeographicScopeResponse> GetAsync(int companyId, CancellationToken cancellationToken)
    {
        var tenantId = actor.TenantId ?? throw new InvalidOperationException("A tenant is required to read company geographic scope.");
        if (actor.CompanyId is not > 0 || actor.CompanyId.Value != companyId)
            throw new InvalidOperationException("The company context does not match the requested company.");

        var links = await context.CompanyCountries.AsNoTracking()
            .Where(item => item.TenantId == tenantId && item.CompanyId == companyId && !item.IsDeleted)
            .Select(item => new { item.CountryId, item.IsDefault })
            .ToListAsync(cancellationToken);
        var company = await context.Companies.AsNoTracking()
            .SingleAsync(item => item.Id == companyId && item.TenantId == tenantId, cancellationToken);
        var countries = await referenceData.GetActiveCountriesAsync(cancellationToken);
        var selected = links.Select(item => item.CountryId).ToHashSet();
        var defaultId = links.SingleOrDefault(item => item.IsDefault)?.CountryId;
        return new CompanyGeographicScopeResponse(companyId, defaultId, company.RegistrationCountryId,
            countries.Select(country => new CompanyCountryOptionResponse(country.Id, country.NameAr, country.NameEn, country.Alpha2Code, country.Alpha3Code,
                selected.Contains(country.Id), defaultId == country.Id, company.RegistrationCountryId == country.Id)).ToArray());
    }

    public Task<bool> AreActiveCountriesAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken) =>
        referenceData.AreActiveCountriesAsync(countryIds, cancellationToken);

    public Task<bool> HasActiveAddressesOutsideScopeAsync(int companyId, IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken) =>
        referenceData.HasActiveAddressesOutsideScopeAsync(companyId, countryIds, cancellationToken);

    public async Task ReplaceAsync(int companyId, IReadOnlyCollection<int> countryIds, int defaultCountryId, int registrationCountryId, CancellationToken cancellationToken)
    {
        var tenantId = actor.TenantId ?? throw new InvalidOperationException("A tenant is required to replace company geographic scope.");
        if (actor.CompanyId is not > 0 || actor.CompanyId.Value != companyId)
            throw new InvalidOperationException("The company context does not match the requested company.");

        var company = await context.Companies
            .SingleAsync(item => item.Id == companyId && item.TenantId == tenantId, cancellationToken);
        var selected = countryIds.ToHashSet();
        company.SetRegistrationCountry(registrationCountryId);
        var existing = await context.CompanyCountries.IgnoreQueryFilters()
            .Where(item => item.TenantId == tenantId && item.CompanyId == companyId).ToListAsync(cancellationToken);
        foreach (var link in existing)
        {
            if (selected.Remove(link.CountryId)) link.Activate(link.CountryId == defaultCountryId);
            else if (!link.IsDeleted) context.CompanyCountries.Remove(link);
        }
        foreach (var countryId in selected)
            context.CompanyCountries.Add(new CompanyCountry(countryId, countryId == defaultCountryId) { TenantId = tenantId, CompanyId = companyId });
    }
}
