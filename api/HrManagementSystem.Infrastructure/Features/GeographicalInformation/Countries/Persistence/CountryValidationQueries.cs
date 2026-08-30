using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public sealed class CountryValidationQueries(ApplicationDbContext context)
    : ICountryValidationQueries
{
    public Task<bool> CountryNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.Countries.AnyAsync(
            country => country.NameEn == normalizedName &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> CountryNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.Countries.AnyAsync(
            country => country.NameAr == normalizedName &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> CountryAlpha2CodeExistsAsync(
        string code,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedCode = NormalizeCode(code);
        return context.Countries.AnyAsync(
            country => country.Alpha2Code == normalizedCode &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> CountryAlpha3CodeExistsAsync(
        string code,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedCode = NormalizeCode(code);
        return context.Countries.AnyAsync(
            country => country.Alpha3Code == normalizedCode &&
                       (!excludedId.HasValue || country.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> CountryExistsAsync(int id, CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(
            country => country.Id == id && !country.IsDeleted,
            cancellationToken);

    private static string NormalizeCode(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToUpperInvariant();
}
