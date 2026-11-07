using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record GlobalCrystalReportFilterRule(string MatchMode, JsonElement Value);

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record GlobalCrystalReportFilterGroup(string Field, string Operator,
    IReadOnlyList<GlobalCrystalReportFilterRule> Constraints);

public static class GlobalCrystalReportFilters
{
    public static bool IsValid(IReadOnlyList<GlobalCrystalReportFilterGroup>? groups)
    {
        if (groups is null) return true;
        if (groups.Count > 6) return false;
        var fields = new HashSet<string>(StringComparer.Ordinal);
        foreach (var group in groups)
        {
            if (group is null || group.Field is null || !fields.Add(group.Field) ||
                group.Operator is not ("and" or "or") || group.Constraints is null ||
                group.Constraints.Count is < 1 or > 4 || group.Constraints.Any(rule => rule is null || !ValidRule(group.Field, rule)))
                return false;
        }
        return true;
    }

    private static bool ValidRule(string field, GlobalCrystalReportFilterRule rule) => field switch
    {
        "displayName" or "reportKey" =>
            rule.MatchMode is "contains" or "notContains" or "startsWith" or "endsWith" or "equals" or "notEquals" &&
            rule.Value.ValueKind == JsonValueKind.String && rule.Value.GetString() is { Length: > 0 and <= 200 } text && !string.IsNullOrWhiteSpace(text),
        "entityKey" => Choice(rule, ["countries", "states", "districts", "system-error-logs"]),
        "status" => Choice(rule, ["published", "draft", "archived"]),
        "currentVersionNumber" => rule.MatchMode is "equals" or "notEquals" or "lt" or "lte" or "gt" or "gte" &&
            rule.Value.ValueKind == JsonValueKind.Number && rule.Value.TryGetInt32(out var number) && number > 0,
        "updatedOn" => rule.MatchMode is "dateIs" or "dateIsNot" or "dateBefore" or "dateAfter" &&
            rule.Value.ValueKind == JsonValueKind.String && DateOnly.TryParseExact(rule.Value.GetString(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _),
        _ => false
    };

    private static bool Choice(GlobalCrystalReportFilterRule rule, string[] values) =>
        rule.MatchMode is "equals" or "notEquals" && rule.Value.ValueKind == JsonValueKind.String &&
        values.Contains(rule.Value.GetString(), StringComparer.Ordinal);
}
