using ErpSystem.Modules.ReferenceData.Contracts.CompanyGeography;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.CompanyGeography;

internal sealed class ReferenceDataCompanyGeographySource(ReferenceDataDbContext context) : IReferenceDataCompanyGeographySource
{
    public async Task<IReadOnlyList<ReferenceCountryOption>> GetActiveCountriesAsync(CancellationToken cancellationToken = default) =>
        await context.Countries.AsNoTracking()
            .Where(country => !country.IsDeleted)
            .OrderBy(country => country.NameEn).ThenBy(country => country.Id)
            .Select(country => new ReferenceCountryOption(country.Id, country.NameAr, country.NameEn, country.Alpha2Code, country.Alpha3Code))
            .ToListAsync(cancellationToken);

    public async Task<bool> AreActiveCountriesAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken = default)
    {
        var ids = countryIds.Distinct().ToArray();
        return await context.Countries.CountAsync(country => ids.Contains(country.Id) && !country.IsDeleted, cancellationToken) == ids.Length;
    }

    public Task<bool> HasActiveAddressesOutsideScopeAsync(int companyId, IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken = default)
    {
        var ids = countryIds.Distinct().ToArray();
        return context.Addresses.AsNoTracking().AnyAsync(address =>
            address.CompanyId == companyId && !address.IsDeleted && !ids.Contains(address.CountryId), cancellationToken);
    }
}
