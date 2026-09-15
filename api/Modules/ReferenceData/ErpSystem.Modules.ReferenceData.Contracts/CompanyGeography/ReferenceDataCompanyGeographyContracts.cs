namespace ErpSystem.Modules.ReferenceData.Contracts.CompanyGeography;

public sealed record ReferenceCountryOption(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code);

public interface IReferenceDataCompanyGeographySource
{
    Task<IReadOnlyList<ReferenceCountryOption>> GetActiveCountriesAsync(CancellationToken cancellationToken = default);
    Task<bool> AreActiveCountriesAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken = default);
    Task<bool> HasActiveAddressesOutsideScopeAsync(int companyId, IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken = default);
}
