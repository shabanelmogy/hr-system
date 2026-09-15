using ErpSystem.Modules.ReferenceData.Contracts.Reporting;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.Reporting;

internal sealed class ReferenceDataReportingSource(ReferenceDataDbContext context) : IReferenceDataReportingSource
{
    public async Task<IReadOnlyList<ReferenceCountryReportRow>> GetCountriesAsync(string? nameAr, string? nameEn, int maximumRows, CancellationToken cancellationToken) =>
        await (from country in context.Countries.AsNoTracking()
               where !country.IsDeleted && (nameAr == null || country.NameAr == nameAr) && (nameEn == null || country.NameEn == nameEn)
               from state in country.States.Where(item => !item.IsDeleted).DefaultIfEmpty()
               orderby country.Id, state == null ? 0 : state.Id
               select new ReferenceCountryReportRow(country.Id, country.NameAr, country.NameEn,
                   state == null ? null : state.Id, state == null ? null : state.NameAr, state == null ? null : state.NameEn))
            .Take(ValidateMaximumRows(maximumRows))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ReferenceStateReportRow>> GetStatesAsync(string? nameAr, string? nameEn, int maximumRows, CancellationToken cancellationToken) =>
        await (from state in context.States.AsNoTracking()
               join country in context.Countries.AsNoTracking() on state.CountryId equals country.Id
               where !state.IsDeleted && !country.IsDeleted && (nameAr == null || state.NameAr == nameAr) && (nameEn == null || state.NameEn == nameEn)
               orderby state.Id
               select new ReferenceStateReportRow(state.Id, state.NameAr, state.NameEn, state.Code, country.Id, country.NameAr, country.NameEn))
            .Take(ValidateMaximumRows(maximumRows))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ReferenceDistrictReportRow>> GetDistrictsAsync(string? nameAr, string? nameEn, string? stateAr, string? stateEn, int maximumRows, CancellationToken cancellationToken) =>
        await context.Districts.AsNoTracking()
            .Where(district => !district.IsDeleted && !district.State!.IsDeleted && !district.State.Country!.IsDeleted &&
                (nameAr == null || district.NameAr == nameAr) && (nameEn == null || district.NameEn == nameEn) &&
                (stateAr == null || district.State.NameAr == stateAr) && (stateEn == null || district.State.NameEn == stateEn))
            .OrderBy(district => district.Id)
            .Select(district => new ReferenceDistrictReportRow(district.Id, district.NameAr, district.NameEn, district.Code,
                district.StateId, district.State!.NameAr, district.State.NameEn, district.Addresses.Count(address => !address.IsDeleted)))
            .Take(ValidateMaximumRows(maximumRows))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ReferenceAddressTypeReportRow>> GetAddressTypesAsync(string? nameAr, string? nameEn, int maximumRows, CancellationToken cancellationToken) =>
        await context.AddressTypes.AsNoTracking()
            .Where(item => !item.IsDeleted && (nameAr == null || item.NameAr == nameAr) && (nameEn == null || item.NameEn == nameEn))
            .OrderBy(item => item.Id)
            .Select(item => new ReferenceAddressTypeReportRow(item.Id, item.NameAr, item.NameEn, item.Addresses.Count(address => !address.IsDeleted)))
            .Take(ValidateMaximumRows(maximumRows))
            .ToListAsync(cancellationToken);

    private static int ValidateMaximumRows(int maximumRows) =>
        maximumRows is > 0 and <= 100_001
            ? maximumRows
            : throw new ArgumentOutOfRangeException(nameof(maximumRows));
}
