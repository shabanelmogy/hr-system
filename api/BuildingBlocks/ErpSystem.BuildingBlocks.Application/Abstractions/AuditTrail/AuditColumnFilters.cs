using ErpSystem.BuildingBlocks.Application.Filtering;

namespace ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;

public static class AuditColumnFilters
{
    public static IReadOnlyDictionary<string, ColumnFilterField> Fields { get; } = new Dictionary<string, ColumnFilterField>(StringComparer.Ordinal)
    {
        ["occurredOn"] = new(ColumnFilterKind.Date),
        ["action"] = new(ColumnFilterKind.Text, new HashSet<string>(["Created", "Modified", "Deleted", "Restored"], StringComparer.Ordinal)),
        ["record"] = new(ColumnFilterKind.Text),
        ["moduleCode"] = new(ColumnFilterKind.Text),
        ["userName"] = new(ColumnFilterKind.Text),
        ["changeCount"] = new(ColumnFilterKind.Number)
    };
}
