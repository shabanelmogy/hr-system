using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Features.OrganizationalStructure.CompanyGeographicScope.Persistence;

public sealed class CompanyGeographicScopeStore(
    ApplicationDbContext context,
    ICurrentActor currentActor)
    : ICompanyGeographicScopeStore
{
    public async Task<CompanyGeographicScopeResponse> GetAsync(
        int companyId,
        CancellationToken cancellationToken)
    {
        var selectedLinks = await context.CompanyCountries
            .AsNoTracking()
            .Where(link => link.CompanyId == companyId && !link.IsDeleted)
            .Select(link => new { link.CountryId, link.IsDefault })
            .ToListAsync(cancellationToken);

        var selectedIds = selectedLinks
            .Select(link => link.CountryId)
            .ToHashSet();
        var defaultCountryId = selectedLinks
            .Where(link => link.IsDefault)
            .Select(link => (int?)link.CountryId)
            .SingleOrDefault();
        var registrationCountryId = await context.Companies
            .AsNoTracking()
            .Where(company => company.Id == companyId)
            .Select(company => company.RegistrationCountryId)
            .SingleAsync(cancellationToken);

        var countries = await context.Countries
            .AsNoTracking()
            .Where(country => !country.IsDeleted)
            .OrderBy(country => country.NameEn)
            .ThenBy(country => country.Id)
            .Select(country => new
            {
                country.Id,
                country.NameAr,
                country.NameEn,
                country.Alpha2Code,
                country.Alpha3Code
            })
            .ToListAsync(cancellationToken);

        var options = countries
            .Select(country => new CompanyCountryOptionResponse(
                country.Id,
                country.NameAr,
                country.NameEn,
                country.Alpha2Code,
                country.Alpha3Code,
                selectedIds.Contains(country.Id),
                defaultCountryId == country.Id,
                registrationCountryId == country.Id))
            .ToList();

        return new CompanyGeographicScopeResponse(
            companyId,
            defaultCountryId,
            registrationCountryId,
            options);
    }

    public async Task<bool> AreActiveCountriesAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken)
    {
        var distinctIds = countryIds.Distinct().ToArray();
        var activeCount = await context.Countries
            .AsNoTracking()
            .CountAsync(country => distinctIds.Contains(country.Id) && !country.IsDeleted, cancellationToken);

        return activeCount == distinctIds.Length;
    }

    public async Task ClearDefaultAsync(int companyId, CancellationToken cancellationToken)
    {
        var defaults = await context.CompanyCountries
            .Where(link => link.CompanyId == companyId && !link.IsDeleted && link.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var link in defaults)
            link.ClearDefault();
    }

    public async Task ReplaceAsync(
        int companyId,
        IReadOnlyCollection<int> countryIds,
        int defaultCountryId,
        int registrationCountryId,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId
            ?? throw new InvalidOperationException("A tenant is required to replace company geographic scope.");
        var selectedIds = countryIds.ToHashSet();
        var company = await context.Companies
            .SingleAsync(item => item.Id == companyId, cancellationToken);
        company.SetRegistrationCountry(registrationCountryId);
        var existingLinks = await context.CompanyCountries
            .IgnoreQueryFilters()
            .Where(link => link.TenantId == tenantId && link.CompanyId == companyId)
            .ToListAsync(cancellationToken);

        foreach (var link in existingLinks)
        {
            if (selectedIds.Contains(link.CountryId))
            {
                link.Activate(link.CountryId == defaultCountryId);
                selectedIds.Remove(link.CountryId);
                continue;
            }

            if (!link.IsDeleted)
            {
                link.ClearDefault();
                context.CompanyCountries.Remove(link);
            }
        }

        foreach (var countryId in selectedIds)
        {
            context.CompanyCountries.Add(
                new CompanyCountry(countryId, countryId == defaultCountryId)
                {
                    CompanyId = companyId
                });
        }
    }
}
