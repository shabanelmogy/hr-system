using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Persistence;

public sealed class StateValidationQueries(ApplicationDbContext context)
    : IStateValidationQueries
{
    public Task<bool> StateNameEnExistsAsync(
        string name,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.States.AnyAsync(
            state => state.NameEn == normalizedName &&
                     state.CountryId == countryId &&
                     (!excludedId.HasValue || state.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> StateNameArExistsAsync(
        string name,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.States.AnyAsync(
            state => state.NameAr == normalizedName &&
                     state.CountryId == countryId &&
                     (!excludedId.HasValue || state.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> StateCodeExistsAsync(
        string code,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedCode = NormalizeCode(code);
        return context.States.AnyAsync(
            state => state.Code == normalizedCode &&
                     state.CountryId == countryId &&
                     (!excludedId.HasValue || state.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> StateExistsAsync(int id, CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.Id == id && !state.IsDeleted,
            cancellationToken);

    public Task<int?> GetCountryIdAsync(int stateId, CancellationToken cancellationToken) =>
        context.States
            .Where(state => state.Id == stateId && !state.IsDeleted)
            .Select(state => (int?)state.CountryId)
            .FirstOrDefaultAsync(cancellationToken);

    private static string NormalizeCode(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToUpperInvariant();
}
