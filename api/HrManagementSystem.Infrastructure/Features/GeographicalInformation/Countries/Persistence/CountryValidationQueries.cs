using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public sealed class CountryValidationQueries(ApplicationDbContext context)
    : ICountryValidationQueries
{
    public Task<bool> CountryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(
            country => country.NameEn == name &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> CountryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(
            country => country.NameAr == name &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> CountryAlpha2CodeExistsAsync(
        string code,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(
            country => country.Alpha2Code == code &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> CountryAlpha3CodeExistsAsync(
        string code,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(
            country => country.Alpha3Code == code &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> CountryExistsAsync(int id, CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(
            country => country.Id == id && !country.IsDeleted,
            cancellationToken);
}
