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

/// <summary>
/// Transaction-owned application-lock names for geography records. Any module that
/// writes data depending on an active Country (for example the company geographic
/// scope) takes the same lock as Country archive/restore so the two serialize.
/// </summary>
public static class ReferenceDataLockResources
{
    public static string Country(int countryId) => $"GeographicalInformation:Country:{countryId}";
}
