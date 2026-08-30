using HrManagementSystem.Application.Features.GeographicalInformation.Validation;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Seeds;

/// <summary>
/// Adds the Egyptian reference hierarchy required by the Egypt-first deployment profile.
/// This seed is deliberately additive: it never overwrites, restores, or otherwise changes
/// user-maintained geographic values.
/// </summary>
public static class EgyptGeographicSeed
{
    public const string Version = "2026.08.30.2";

    private const string EgyptAlpha2Code = "EG";
    private const string EgyptArabicName = "مصر";
    private const string EgyptEnglishName = "Egypt";

    private static readonly IReadOnlyList<GovernorateDefinition> Governorates =
    [
        new("ALX", "الإسكندرية", "Alexandria"),
        new("ASN", "أسوان", "Aswan"),
        new("AST", "أسيوط", "Asyut"),
        new("BA", "البحر الأحمر", "Red Sea"),
        new("BH", "البحيرة", "Beheira"),
        new("BNS", "بني سويف", "Beni Suef"),
        new("CAI", "القاهرة", "Cairo"),
        new("DK", "الدقهلية", "Dakahlia"),
        new("DT", "دمياط", "Damietta"),
        new("FYM", "الفيوم", "Faiyum"),
        new("GH", "الغربية", "Gharbia"),
        new("GZ", "الجيزة", "Giza"),
        new("IS", "الإسماعيلية", "Ismailia"),
        new("JS", "جنوب سيناء", "South Sinai"),
        new("KB", "القليوبية", "Qalyubia"),
        new("KFS", "كفر الشيخ", "Kafr El Sheikh"),
        new("KN", "قنا", "Qena"),
        new("LX", "الأقصر", "Luxor"),
        new("MNF", "المنوفية", "Monufia"),
        new("MN", "المنيا", "Minya"),
        new("MT", "مطروح", "Matrouh"),
        new("PTS", "بورسعيد", "Port Said"),
        new("SHG", "سوهاج", "Sohag"),
        new("SHR", "الشرقية", "Sharqia"),
        new("SIN", "شمال سيناء", "North Sinai"),
        new("SUZ", "السويس", "Suez"),
        new("WAD", "الوادي الجديد", "New Valley")
    ];

    public static async Task SeedAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken = default)
    {
        var seedUserId = await context.Users
            .IgnoreQueryFilters()
            .OrderBy(user => user.Id)
            .Select(user => user.Id)
            .FirstOrDefaultAsync(cancellationToken);

        // Auditable reference data must always retain a real user as its creator. The normal
        // startup sequence creates bootstrap users before this seed; without one, defer safely.
        if (string.IsNullOrWhiteSpace(seedUserId))
            return;

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
                Alpha2Code = EgyptAlpha2Code,
                CreatedById = seedUserId
            };
            context.Countries.Add(egypt);
            await context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            if (egypt.IsDeleted)
                return;

            if (string.IsNullOrWhiteSpace(egypt.Alpha2Code))
            {
                egypt.Alpha2Code = EgyptAlpha2Code;
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        var states = await context.States
            .IgnoreQueryFilters()
            .Where(state => state.CountryId == egypt.Id)
            .ToListAsync(cancellationToken);

        var missingGovernorates = new List<State>();
        foreach (var governorate in Governorates)
        {
            var existing = ResolveGovernorate(states, governorate);
            if (existing is not null)
            {
                continue;
            }

            var state = new State
            {
                CountryId = egypt.Id,
                Code = governorate.Code,
                NameAr = governorate.NameAr,
                NameEn = governorate.NameEn,
                CreatedById = seedUserId
            };
            missingGovernorates.Add(state);
            states.Add(state);
        }

        if (missingGovernorates.Count == 0)
            return;

        context.States.AddRange(missingGovernorates);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static Country? ResolveEgypt(IReadOnlyCollection<Country> countries)
    {
        var codeMatches = countries
            .Where(country => IsSameCode(country.Alpha2Code, EgyptAlpha2Code))
            .ToList();
        var nameMatches = countries
            .Where(country =>
                IsSameName(country.NameAr, EgyptArabicName) ||
                IsSameName(country.NameEn, EgyptEnglishName))
            .ToList();
        var candidates = codeMatches
            .Concat(nameMatches)
            .DistinctBy(country => country.Id)
            .ToList();

        if (candidates.Count == 0)
            return null;

        if (candidates.Count != 1)
            throw new InvalidOperationException(
                "Egypt geographic seed found conflicting country rows for Alpha-2 code 'EG' or the Egypt names. " +
                "Resolve the duplicate country records before seeding.");

        var candidate = candidates[0];
        if (!string.IsNullOrWhiteSpace(candidate.Alpha2Code) &&
            !IsSameCode(candidate.Alpha2Code, EgyptAlpha2Code))
        {
            throw new InvalidOperationException(
                "Egypt geographic seed found an Egypt-named country with a conflicting nonblank Alpha-2 code. " +
                "Correct the country record explicitly before seeding.");
        }

        return candidate;
    }

    private static State? ResolveGovernorate(
        IReadOnlyCollection<State> states,
        GovernorateDefinition governorate)
    {
        var codeMatches = states
            .Where(state => IsSameCode(state.Code, governorate.Code))
            .ToList();
        var nameMatches = states
            .Where(state =>
                IsSameName(state.NameAr, governorate.NameAr) ||
                IsSameName(state.NameEn, governorate.NameEn))
            .ToList();
        var candidates = codeMatches
            .Concat(nameMatches)
            .DistinctBy(state => state.Id)
            .ToList();

        if (candidates.Count == 0)
            return null;

        if (candidates.Count != 1)
            throw new InvalidOperationException(
                $"Egypt geographic seed found conflicting governorate rows for '{governorate.Code}'. " +
                "Resolve the duplicate records before seeding.");

        return candidates[0];
    }

    private static bool IsSameCode(string? value, string expected) =>
        string.Equals(NormalizeCode(value), expected, StringComparison.Ordinal);

    private static bool IsSameName(string? value, string expected) =>
        string.Equals(
            GeographicalNameRules.Normalize(value),
            GeographicalNameRules.Normalize(expected),
            StringComparison.OrdinalIgnoreCase);

    private static string NormalizeCode(string? value) =>
        GeographicalNameRules.Normalize(value).ToUpperInvariant();

    private sealed record GovernorateDefinition(string Code, string NameAr, string NameEn);
}
