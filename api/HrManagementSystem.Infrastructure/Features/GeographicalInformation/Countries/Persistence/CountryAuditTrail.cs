using System.Text.Json;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public sealed class CountryAuditTrail(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    TimeProvider timeProvider) : ICountryAuditTrail
{
    public void RecordUpdate(Country existingCountry, Country updatedCountry)
    {
        var oldValues = Values(existingCountry);
        var newValues = Values(updatedCountry);
        var changedKeys = oldValues.Keys
            .Where(key => !Equals(oldValues[key], newValues[key]))
            .ToArray();
        if (changedKeys.Length == 0)
            return;

        context.EntityChangeLogs.Add(new EntityChangeLog
        {
            EntityId = existingCountry.Id,
            EntityName = nameof(Country),
            JsonOldValues = JsonSerializer.Serialize(
                changedKeys.ToDictionary(key => key, key => oldValues[key])),
            JsonNewValues = JsonSerializer.Serialize(
                changedKeys.ToDictionary(key => key, key => newValues[key])),
            ChangedById = currentActor.UserId ?? throw new InvalidOperationException(
                "An authenticated actor is required to update a country."),
            ChangedAt = timeProvider.GetUtcNow().UtcDateTime,
            ChangedByPc = Environment.MachineName
        });
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
