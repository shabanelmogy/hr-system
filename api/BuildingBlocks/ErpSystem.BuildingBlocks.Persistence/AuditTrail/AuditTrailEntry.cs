using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;

namespace ErpSystem.BuildingBlocks.Persistence.AuditTrail;

/// <summary>
/// One row of a module's audit trail. Every module stores its own entries in its own
/// schema (table <see cref="TableName"/>), written in the same save as the business change.
/// </summary>
public sealed class AuditTrailEntry
{
    public const string TableName = "AuditTrailEntries";

    public long Id { get; set; }
    public string? TenantId { get; set; }
    public int? CompanyId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityKey { get; set; } = string.Empty;
    public string? EntityDisplay { get; set; }
    public AuditAction Action { get; set; }
    public string? UserId { get; set; }
    public DateTime OccurredOnUtc { get; set; }
    public string? CorrelationId { get; set; }
    public int ChangeCount { get; set; }
    public string ChangesJson { get; set; } = "[]";
}
