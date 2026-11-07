using ErpSystem.BuildingBlocks.Application.Filtering;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

public static class ErrorLogColumnFilters
{
    public static IReadOnlyDictionary<string, ColumnFilterField> Fields { get; } = new Dictionary<string, ColumnFilterField>(StringComparer.Ordinal)
    {
        ["occurredOnUtc"] = new(ColumnFilterKind.Date),
        ["source"] = new(ColumnFilterKind.Text, new HashSet<string>(["api", "job", "web", "mobile"], StringComparer.Ordinal)),
        ["severity"] = new(ColumnFilterKind.Text, new HashSet<string>(["error", "warning"], StringComparer.Ordinal)),
        ["userName"] = new(ColumnFilterKind.Text),
        ["service"] = new(ColumnFilterKind.Text),
        ["action"] = new(ColumnFilterKind.Text),
        ["statusCode"] = new(ColumnFilterKind.Number),
        ["durationMs"] = new(ColumnFilterKind.Number),
        ["client"] = new(ColumnFilterKind.Text),
        ["browser"] = new(ColumnFilterKind.Text),
        ["summary"] = new(ColumnFilterKind.Text),
        ["ipAddress"] = new(ColumnFilterKind.Text)
    };

    public static bool IsValid(string? json, bool system) =>
        ColumnFilterSet.TryParse(json, Fields, out var groups) &&
        (system || groups.All(group => group.Field != "ipAddress"));
}
