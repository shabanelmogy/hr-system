using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CountryFilterConstraint(string MatchMode, JsonElement Value);

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CountryFilterGroup(string Field, string Operator, IReadOnlyList<CountryFilterConstraint> Constraints);

public static class CountryGridFilters
{
    public const int MaximumFields = 11;
    public const int MaximumRules = 4;
    private static readonly HashSet<string> TextFields = ["nameAr", "nameEn", "alpha2Code", "alpha3Code", "phoneCode", "currencyCode"];

    public static bool IsValid(IReadOnlyList<CountryFilterGroup>? groups)
    {
        if (groups is null) return true;
        if (groups.Count > MaximumFields) return false;
        var fields = new HashSet<string>(StringComparer.Ordinal);
        foreach (var group in groups)
        {
            if (group is null || group.Field is null || !fields.Add(group.Field) ||
                group.Operator is not ("and" or "or") || group.Constraints is null ||
                group.Constraints.Count is < 1 or > MaximumRules) return false;
            foreach (var rule in group.Constraints)
            {
                if (rule is null || !RuleIsValid(group.Field, rule)) return false;
            }
        }
        return true;
    }

    private static bool RuleIsValid(string field, CountryFilterConstraint rule)
    {
        if (TextFields.Contains(field))
            return rule.MatchMode is "contains" or "notContains" or "equals" or "notEquals" or "startsWith" or "endsWith" &&
                rule.Value.ValueKind == JsonValueKind.String && rule.Value.GetString() is { Length: > 0 and <= 200 } text && !string.IsNullOrWhiteSpace(text);
        return field switch
        {
            "id" or "statesCount" => rule.MatchMode is "equals" or "notEquals" or "lt" or "lte" or "gt" or "gte" &&
                rule.Value.ValueKind == JsonValueKind.Number && rule.Value.TryGetInt32(out _),
            "createdOn" or "updatedOn" => rule.MatchMode is "dateIs" or "dateIsNot" or "dateBefore" or "dateAfter" &&
                rule.Value.ValueKind == JsonValueKind.String && DateOnly.TryParseExact(rule.Value.GetString(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _),
            "isDeleted" => rule.MatchMode is "equals" or "notEquals" && rule.Value.ValueKind is JsonValueKind.True or JsonValueKind.False,
            _ => false
        };
    }
}
