using System.Text.Json;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public sealed class CountryAuditTrail(
    IEntityChangeLogStore changeLogStore,
    ICurrentActor currentActor,
    TimeProvider timeProvider) : ICountryAuditTrail
{
    public async Task RecordUpdateAsync(Country existingCountry, Country updatedCountry, CancellationToken cancellationToken)
    {
        var oldValues = Values(existingCountry);
        var newValues = Values(updatedCountry);
        var changedKeys = oldValues.Keys
            .Where(key => !Equals(oldValues[key], newValues[key]))
            .ToArray();
        if (changedKeys.Length == 0)
            return;

        await changeLogStore.AddAsync(new EntityChangeLogRecord(
            existingCountry.Id, null, nameof(Country),
            JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => oldValues[key])),
            JsonSerializer.Serialize(changedKeys.ToDictionary(key => key, key => newValues[key])),
            currentActor.UserId ?? throw new InvalidOperationException("An authenticated actor is required to update a country."),
            Environment.MachineName, timeProvider.GetUtcNow().UtcDateTime), cancellationToken);
    }

    private static Dictionary<string, string?> Values(Country country) =>
        new(StringComparer.Ordinal)
        {
            [nameof(Country.NameAr)] = country.NameAr,
            [nameof(Country.NameEn)] = country.NameEn,
            [nameof(Country.Alpha2Code)] = country.Alpha2Code,
            [nameof(Country.Alpha3Code)] = country.Alpha3Code,
            [nameof(Country.PhoneCode)] = country.PhoneCode,
            [nameof(Country.CurrencyCode)] = country.CurrencyCode
        };
}
