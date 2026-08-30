using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Persistence;

public sealed class DistrictValidationQueries(ApplicationDbContext context)
    : IDistrictValidationQueries
{
    public Task<bool> DistrictNameEnExistsAsync(
        string name,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.Districts.AnyAsync(
            district => district.NameEn == normalizedName &&
                        district.StateId == stateId &&
                        (!excludedId.HasValue || district.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> DistrictNameArExistsAsync(
        string name,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.Districts.AnyAsync(
            district => district.NameAr == normalizedName &&
                        district.StateId == stateId &&
                        (!excludedId.HasValue || district.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> DistrictCodeExistsAsync(
        string code,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedCode = NormalizeCode(code);
        return context.Districts.AnyAsync(
            district => district.Code == normalizedCode &&
                        district.StateId == stateId &&
                        (!excludedId.HasValue || district.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> DistrictExistsAsync(int id, CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(
            district => district.Id == id && !district.IsDeleted,
            cancellationToken);

    public Task<int?> GetStateIdAsync(int districtId, CancellationToken cancellationToken) =>
        context.Districts
            .Where(district => district.Id == districtId && !district.IsDeleted)
            .Select(district => (int?)district.StateId)
            .FirstOrDefaultAsync(cancellationToken);

    private static string NormalizeCode(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToUpperInvariant();
}
