using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public sealed class CountryWriteStore(ApplicationDbContext context) : ICountryWriteStore
{
    public void Add(Country country) => context.Countries.Add(country);

    public void AddRange(IReadOnlyCollection<Country> countries) =>
        context.Countries.AddRange(countries);

    public Task<Country?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.Countries.FirstOrDefaultAsync(country => country.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Country>> GetForUpdateAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken) =>
        await context.Countries
            .Where(country => ids.Contains(country.Id))
            .ToListAsync(cancellationToken);

    public Task<bool> HasAnyConflictAsync(
        IReadOnlyCollection<Country> countries,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var nameArValues = countries.Select(country => country.NameAr).ToList();
        var nameEnValues = countries.Select(country => country.NameEn).ToList();
        var alpha2CodeValues = countries
            .Select(country => country.Alpha2Code)
            .Where(code => code is not null)
            .ToList();
        var alpha3CodeValues = countries
            .Select(country => country.Alpha3Code)
            .Where(code => code is not null)
            .ToList();

        return context.Countries.AnyAsync(
            country =>
                (!excludedId.HasValue || country.Id != excludedId.Value) &&
                (nameArValues.Contains(country.NameAr) ||
                 nameEnValues.Contains(country.NameEn) ||
                 country.Alpha2Code != null && alpha2CodeValues.Contains(country.Alpha2Code) ||
                 country.Alpha3Code != null && alpha3CodeValues.Contains(country.Alpha3Code)),
            cancellationToken);
    }

    public Task<bool> HasActiveStatesAsync(
        int countryId,
        CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.CountryId == countryId && !state.IsDeleted,
            cancellationToken);

    public Task<bool> HasActiveStatesAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => countryIds.Contains(state.CountryId) && !state.IsDeleted,
            cancellationToken);
}
