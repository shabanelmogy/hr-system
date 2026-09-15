using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.States.Entities;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Seeds;

/// <summary>
/// Adds the Egypt reference hierarchy without changing administrator-maintained data.
/// The seed is module-owned so ReferenceData can be deployed independently from HR.
/// </summary>
public static class EgyptGeographicSeed
{
    public const string Version = "2026.09.13.1";

    private const string EgyptAlpha2Code = "EG";
    private const string EgyptArabicName = "مصر";
    private const string EgyptEnglishName = "Egypt";

    private static readonly IReadOnlyList<GovernorateDefinition> Governorates =
    [
        new("ALX", "الإسكندرية", "Alexandria"), new("ASN", "أسوان", "Aswan"),
        new("AST", "أسيوط", "Asyut"), new("BA", "البحر الأحمر", "Red Sea"),
        new("BH", "البحيرة", "Beheira"), new("BNS", "بني سويف", "Beni Suef"),
        new("CAI", "القاهرة", "Cairo"), new("DK", "الدقهلية", "Dakahlia"),
        new("DT", "دمياط", "Damietta"), new("FYM", "الفيوم", "Faiyum"),
        new("GH", "الغربية", "Gharbia"), new("GZ", "الجيزة", "Giza"),
        new("IS", "الإسماعيلية", "Ismailia"), new("JS", "جنوب سيناء", "South Sinai"),
        new("KB", "القليوبية", "Qalyubia"), new("KFS", "كفر الشيخ", "Kafr El Sheikh"),
        new("KN", "قنا", "Qena"), new("LX", "الأقصر", "Luxor"),
        new("MNF", "المنوفية", "Monufia"), new("MN", "المنيا", "Minya"),
        new("MT", "مطروح", "Matrouh"), new("PTS", "بورسعيد", "Port Said"),
        new("SHG", "سوهاج", "Sohag"), new("SHR", "الشرقية", "Sharqia"),
        new("SIN", "شمال سيناء", "North Sinai"), new("SUZ", "السويس", "Suez"),
        new("WAD", "الوادي الجديد", "New Valley")
    ];

    public static async Task SeedAsync(
        ReferenceDataDbContext context,
        CancellationToken cancellationToken = default)
    {
        var countries = await context.Countries
            .IgnoreQueryFilters()
            .ToListAsync(cancellationToken);

        var egypt = ResolveEgypt(countries);
        if (egypt is null)
        {
            egypt = new Country
            {
                NameAr = EgyptArabicName,
                NameEn = EgyptEnglishName,
                Alpha2Code = EgyptAlpha2Code
            };
            context.Countries.Add(egypt);
            await context.SaveChangesAsync(cancellationToken);
        }
        else if (egypt.IsDeleted)
        {
            return;
        }
        else if (string.IsNullOrWhiteSpace(egypt.Alpha2Code))
        {
            egypt.Alpha2Code = EgyptAlpha2Code;
            await context.SaveChangesAsync(cancellationToken);
        }

        var states = await context.States
            .IgnoreQueryFilters()
            .Where(state => state.CountryId == egypt.Id)
            .ToListAsync(cancellationToken);

        var missing = Governorates
            .Where(definition => ResolveGovernorate(states, definition) is null)
            .Select(definition => new State
            {
                CountryId = egypt.Id,
                Code = definition.Code,
                NameAr = definition.NameAr,
                NameEn = definition.NameEn
            })
            .ToArray();

        if (missing.Length == 0)
            return;

        context.States.AddRange(missing);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static Country? ResolveEgypt(IReadOnlyCollection<Country> countries)
    {
        var candidates = countries
            .Where(country => IsSameCode(country.Alpha2Code, EgyptAlpha2Code) ||
                             IsSameName(country.NameAr, EgyptArabicName) ||
                             IsSameName(country.NameEn, EgyptEnglishName))
            .ToList();

        if (candidates.Count == 0)
            return null;
        if (candidates.Count != 1)
            throw new InvalidOperationException("Egypt geographic seed found conflicting country rows.");

        var candidate = candidates[0];
        if (!string.IsNullOrWhiteSpace(candidate.Alpha2Code) &&
            !IsSameCode(candidate.Alpha2Code, EgyptAlpha2Code))
            throw new InvalidOperationException("Egypt geographic seed found a conflicting Alpha-2 code.");

        return candidate;
    }

    private static State? ResolveGovernorate(
        IReadOnlyCollection<State> states,
        GovernorateDefinition governorate) => states
        .Where(state => IsSameCode(state.Code, governorate.Code) ||
                        IsSameName(state.NameAr, governorate.NameAr) ||
                        IsSameName(state.NameEn, governorate.NameEn))
        .ToList() switch
    {
        [] => null,
        [var state] => state,
        _ => throw new InvalidOperationException($"Egypt geographic seed found conflicting governorate rows for '{governorate.Code}'.")
    };

    private static bool IsSameCode(string? value, string expected) =>
        string.Equals(GeographicalNameRules.Normalize(value).ToUpperInvariant(), expected, StringComparison.Ordinal);

    private static bool IsSameName(string? value, string expected) =>
        string.Equals(GeographicalNameRules.Normalize(value), GeographicalNameRules.Normalize(expected), StringComparison.OrdinalIgnoreCase);

    private sealed record GovernorateDefinition(string Code, string NameAr, string NameEn);
}
