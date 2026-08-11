using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Persistence;

public sealed class DistrictValidationQueries(ApplicationDbContext context)
    : IDistrictValidationQueries
{
    public Task<bool> DistrictNameEnExistsAsync(
        string name,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(
            district => district.NameEn == name &&
                        district.StateId == stateId &&
                        (!excludedId.HasValue || district.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> DistrictNameArExistsAsync(
        string name,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(
            district => district.NameAr == name &&
                        district.StateId == stateId &&
                        (!excludedId.HasValue || district.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> DistrictCodeExistsAsync(
        string code,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(
            district => district.Code == code &&
                        district.StateId == stateId &&
                        (!excludedId.HasValue || district.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> DistrictExistsAsync(int id, CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(
            district => district.Id == id && !district.IsDeleted,
            cancellationToken);
}
