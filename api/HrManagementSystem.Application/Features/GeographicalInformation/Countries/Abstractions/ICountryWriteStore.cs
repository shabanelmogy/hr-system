using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryWriteStore
{
    void Add(Country country);

    void AddRange(IReadOnlyCollection<Country> countries);

    Task<Country?> GetForUpdateAsync(int id, CancellationToken cancellationToken);

    Task<IReadOnlyList<Country>> GetForUpdateAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken);

    Task<bool> HasAnyConflictAsync(
        IReadOnlyCollection<Country> countries,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> HasActiveStatesAsync(int countryId, CancellationToken cancellationToken);

    Task<bool> HasActiveStatesAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken);

    Task<bool> HasActiveAddressesAsync(int countryId, CancellationToken cancellationToken);

    Task<bool> HasActiveAddressesAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken);

    Task<bool> HasCompanyUsageAsync(int countryId, CancellationToken cancellationToken);

    Task<bool> HasCompanyUsageAsync(
        IReadOnlyCollection<int> countryIds,
        CancellationToken cancellationToken);
}
