using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryWriteStore
{
    void Add(Country country);

    void AddRange(IReadOnlyCollection<Country> countries);

    Task<Country?> GetForUpdateAsync(int id, CancellationToken cancellationToken);

    Task<bool> HasAnyConflictAsync(
        IReadOnlyCollection<Country> countries,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> HasActiveStatesAsync(int countryId, CancellationToken cancellationToken);
}
