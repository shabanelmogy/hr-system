namespace ErpSystem.Modules.ReferenceData.Contracts.Reporting;

public sealed record ReferenceCountryReportRow(
    int CountryId, string CountryAr, string CountryEn,
    int? StateId, string? StateAr, string? StateEn);

public sealed record ReferenceStateReportRow(
    int StateId, string StateAr, string StateEn, string StateCode,
    int CountryId, string CountryAr, string CountryEn);

public sealed record ReferenceDistrictReportRow(
    int DistrictId, string DistrictAr, string DistrictEn, string DistrictCode,
    int StateId, string StateAr, string StateEn, int AddressesCount);

public sealed record ReferenceAddressTypeReportRow(
    int AddressTypeId, string AddressTypeAr, string AddressTypeEn, int AddressesCount);

public interface IReferenceDataReportingSource
{
    Task<IReadOnlyList<ReferenceCountryReportRow>> GetCountriesAsync(string? nameAr, string? nameEn, int maximumRows, CancellationToken cancellationToken);
    Task<IReadOnlyList<ReferenceStateReportRow>> GetStatesAsync(string? nameAr, string? nameEn, int maximumRows, CancellationToken cancellationToken);
    Task<IReadOnlyList<ReferenceDistrictReportRow>> GetDistrictsAsync(string? nameAr, string? nameEn, string? stateAr, string? stateEn, int maximumRows, CancellationToken cancellationToken);
    Task<IReadOnlyList<ReferenceAddressTypeReportRow>> GetAddressTypesAsync(string? nameAr, string? nameEn, int maximumRows, CancellationToken cancellationToken);
}
