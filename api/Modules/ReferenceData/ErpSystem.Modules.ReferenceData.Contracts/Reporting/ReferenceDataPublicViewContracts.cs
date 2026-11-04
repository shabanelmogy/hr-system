namespace ErpSystem.Modules.ReferenceData.Contracts.Reporting;

public sealed record ReferencePublicViewColumn(string Name, string Type, bool Nullable);
public sealed record ReferencePublicViewData(
    string ViewName, string Fingerprint, IReadOnlyList<ReferencePublicViewColumn> Columns,
    IReadOnlyList<object?[]> Rows);
public sealed record ReferencePublicViewName(string ViewName, bool IsSchemaBound);
public sealed record ReferencePublicViewPage(IReadOnlyList<ReferencePublicViewName> Items, int TotalCount);

public interface IReferenceDataPublicViewSource
{
    Task<ReferencePublicViewPage?> ListAsync(string sourceKey, string? search, int page, int pageSize,
        CancellationToken cancellationToken);
    Task<ReferencePublicViewData?> ReadAsync(string viewName, string sourceKey, int maximumRows,
        IReadOnlyDictionary<string, string?> columnFilters, CancellationToken cancellationToken,
        IReadOnlyList<string>? selectedColumns = null);
}
