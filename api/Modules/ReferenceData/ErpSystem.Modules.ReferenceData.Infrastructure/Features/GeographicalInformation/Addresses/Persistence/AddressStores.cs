using System.Linq.Expressions;
using System.Text.Json;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Addresses.Persistence;

public sealed class AddressReadStore(ReferenceDataDbContext context) : IAddressReadStore
{
    private static readonly Expression<Func<Address, AddressResponse>> Projection = address => new AddressResponse(
        address.Id,
        address.CountryId,
        address.StateId,
        address.DistrictId,
        address.City,
        address.StreetLine1,
        address.StreetLine2,
        address.BuildingNumber,
        address.Floor,
        address.ApartmentNumber,
        address.PostalCode,
        address.AdditionalInfo,
        address.Latitude,
        address.Longitude,
        address.AddressTypeId,
        address.CreatedOn,
        address.UpdatedOn,
        address.IsDeleted);

    public async Task<IReadOnlyList<AddressResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await context.Addresses.AsNoTracking()
            .Select(Projection)
            .ToListAsync(cancellationToken);

    public Task<AddressResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.Addresses.AsNoTracking()
            .Where(address => address.Id == id)
            .Select(Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<AddressResponse?> GetWithDetailsAsync(int id, CancellationToken cancellationToken) =>
        context.Addresses.AsNoTracking()
            .Where(address => address.Id == id)
            .Select(Projection)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<int> CountActiveAsync(CancellationToken cancellationToken) =>
        context.Addresses.CountAsync(cancellationToken);
}

public sealed class AddressWriteStore(ReferenceDataDbContext context, ICurrentActor actor) : IAddressWriteStore
{
    public void Add(Address address) => context.Addresses.Add(address);

    public Task<AddressLifecycleSnapshot?> GetSnapshotAsync(int id, CancellationToken cancellationToken)
    {
        var query = ScopedAddresses().AsNoTracking();
        return query.Where(address => address.Id == id)
            .Select(address => new AddressLifecycleSnapshot(
                address.AddressTypeId,
                address.CountryId,
                address.StateId,
                address.DistrictId,
                address.IsDeleted))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<Address?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        ScopedAddresses().FirstOrDefaultAsync(address => address.Id == id, cancellationToken);

    public Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken) =>
        context.Countries.AnyAsync(country => country.Id == countryId && !country.IsDeleted, cancellationToken);

    public Task<bool> IsStateActiveInCountryAsync(int stateId, int countryId, CancellationToken cancellationToken) =>
        context.States.AnyAsync(
            state => state.Id == stateId && state.CountryId == countryId && !state.IsDeleted,
            cancellationToken);

    public Task<bool> IsDistrictActiveInHierarchyAsync(
        int districtId,
        int? stateId,
        int countryId,
        CancellationToken cancellationToken) =>
        context.Districts.AnyAsync(
            district => district.Id == districtId &&
                        district.StateId == stateId &&
                        !district.IsDeleted &&
                        !district.State!.IsDeleted &&
                        district.State.CountryId == countryId &&
                        !district.State.Country!.IsDeleted,
            cancellationToken);

    public Task<bool> IsAddressTypeActiveAsync(int addressTypeId, CancellationToken cancellationToken) =>
        context.AddressTypes.AnyAsync(
            addressType => addressType.Id == addressTypeId && !addressType.IsDeleted,
            cancellationToken);

    public async Task<bool> IsLinkedToOwnerAsync(int addressId, CancellationToken cancellationToken) =>
        await context.CompanyAddresses.AnyAsync(link => link.AddressId == addressId && !link.IsDeleted, cancellationToken) ||
        await context.BranchAddresses.AnyAsync(link => link.AddressId == addressId && !link.IsDeleted, cancellationToken);

    private IQueryable<Address> ScopedAddresses()
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return context.Addresses.IgnoreQueryFilters().Where(_ => false);

        var tenantId = actor.TenantId;
        var companyId = actor.CompanyId.Value;
        return context.Addresses.IgnoreQueryFilters()
            .Where(address => address.TenantId == tenantId && address.CompanyId == companyId);
    }
}

public sealed class AddressAuditTrail(
    IEntityChangeLogStore changeLogStore,
    ICurrentActor actor,
    TimeProvider timeProvider) : IAddressAuditTrail
{
    public async Task RecordUpdateAsync(Address existingAddress, Address updatedAddress, CancellationToken cancellationToken)
    {
        var oldValues = Values(existingAddress);
        var newValues = Values(updatedAddress);
        var changedKeys = oldValues.Keys.Where(key => !Equals(oldValues[key], newValues[key])).ToArray();
        if (changedKeys.Length == 0)
            return;

        await changeLogStore.AddAsync(new EntityChangeLogRecord(
            existingAddress.Id,
            null,
            nameof(Address),
            JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => oldValues[key])),
            JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => newValues[key])),
            actor.UserId ?? throw new InvalidOperationException("An authenticated actor is required to update an Address."),
            Environment.MachineName,
            timeProvider.GetUtcNow().UtcDateTime), cancellationToken);
    }

    private static Dictionary<string, string?> Values(Address address) => new(StringComparer.Ordinal)
    {
        [nameof(Address.CountryId)] = address.CountryId.ToString(CultureInfo.InvariantCulture),
        [nameof(Address.StateId)] = address.StateId?.ToString(CultureInfo.InvariantCulture),
        [nameof(Address.DistrictId)] = address.DistrictId?.ToString(CultureInfo.InvariantCulture),
        [nameof(Address.City)] = address.City,
        [nameof(Address.StreetLine1)] = address.StreetLine1,
        [nameof(Address.StreetLine2)] = address.StreetLine2,
        [nameof(Address.BuildingNumber)] = address.BuildingNumber,
        [nameof(Address.Floor)] = address.Floor,
        [nameof(Address.ApartmentNumber)] = address.ApartmentNumber,
        [nameof(Address.PostalCode)] = address.PostalCode,
        [nameof(Address.AdditionalInfo)] = address.AdditionalInfo,
        [nameof(Address.Latitude)] = address.Latitude?.ToString(CultureInfo.InvariantCulture),
        [nameof(Address.Longitude)] = address.Longitude?.ToString(CultureInfo.InvariantCulture),
        [nameof(Address.AddressTypeId)] = address.AddressTypeId.ToString(CultureInfo.InvariantCulture)
    };
}
