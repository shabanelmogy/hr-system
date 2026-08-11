using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Persistence;

public sealed class StateValidationQueries(ApplicationDbContext context)
    : IStateValidationQueries
{
    public Task<bool> StateNameEnExistsAsync(
        string name,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.NameEn == name &&
                     state.CountryId == countryId &&
                     (!excludedId.HasValue || state.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> StateNameArExistsAsync(
        string name,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.NameAr == name &&
                     state.CountryId == countryId &&
                     (!excludedId.HasValue || state.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> StateCodeExistsAsync(
        string code,
        int countryId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.Code == code &&
                     state.CountryId == countryId &&
                     (!excludedId.HasValue || state.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> StateExistsAsync(int id, CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.Id == id && !state.IsDeleted,
            cancellationToken);
}
