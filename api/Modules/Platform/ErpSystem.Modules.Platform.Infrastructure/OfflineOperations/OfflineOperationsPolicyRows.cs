namespace ErpSystem.Modules.Platform.Infrastructure.OfflineOperations;

internal sealed class OfflineOperationsPolicyRow
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string ModesJson { get; set; } = "{}";
    public DateTimeOffset UpdatedOn { get; set; }
    public string UpdatedByUserId { get; set; } = string.Empty;
    public byte[] RowVersion { get; set; } = [];
}

internal sealed class OfflineOperationsPolicyHistoryRow
{
    public Guid Id { get; set; }
    public Guid PolicyId { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string? PreviousModesJson { get; set; }
    public string NewModesJson { get; set; } = "{}";
    public DateTimeOffset ChangedOn { get; set; }
    public string ChangedByUserId { get; set; } = string.Empty;
}
