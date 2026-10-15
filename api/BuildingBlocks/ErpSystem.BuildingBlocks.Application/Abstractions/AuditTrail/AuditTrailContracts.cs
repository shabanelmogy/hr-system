namespace ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;

/// <summary>What happened to a record. Values are persisted; never renumber them.</summary>
public enum AuditAction
{
    Created = 1,
    Modified = 2,
    Deleted = 3,
    Restored = 4
}

/// <summary>One field of a record before and after an action.</summary>
public sealed record AuditFieldChange(string Field, string? OldValue, string? NewValue);

/// <summary>
/// Keyset position in the global audit-trail order: newest first, then module code
/// ascending, then the module-local entry id descending.
/// </summary>
public sealed record AuditTrailCursor(DateTime OccurredOnUtc, string ModuleCode, long Id);

/// <summary>
/// Read filter handed to every module source. A null <see cref="TenantId"/> means
/// all tenants (platform administrators only); <see cref="CompanyId"/> limits the
/// result to entries of that company plus tenant-wide entries.
/// </summary>
public sealed record AuditTrailFilter(
    string? TenantId,
    int? CompanyId,
    string? EntityName,
    string? EntityKey,
    AuditAction? Action,
    string? UserId,
    DateTime? FromUtc,
    DateTime? ToUtc,
    AuditTrailCursor? After,
    int Take);

/// <summary>One audit-trail entry without its field details.</summary>
public sealed record AuditTrailRecord(
    string ModuleCode,
    long Id,
    string? TenantId,
    int? CompanyId,
    string EntityName,
    string EntityKey,
    string? EntityDisplay,
    AuditAction Action,
    string? UserId,
    DateTime OccurredOnUtc,
    string? CorrelationId,
    int ChangeCount);

/// <summary>One audit-trail entry with every captured field.</summary>
public sealed record AuditTrailRecordDetails(
    AuditTrailRecord Record,
    IReadOnlyList<AuditFieldChange> Changes);

/// <summary>
/// Module-owned read port over that module's audit-trail table. Each module that
/// persists audited entities registers one source; Platform merges them into the
/// single Audit Trail screen without reading another module's schema directly.
/// </summary>
public interface IAuditTrailSource
{
    string ModuleCode { get; }

    Task<IReadOnlyList<AuditTrailRecord>> ListAsync(
        AuditTrailFilter filter,
        CancellationToken cancellationToken = default);

    Task<AuditTrailRecordDetails?> GetAsync(
        long id,
        string? tenantId,
        int? companyId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> ListEntityNamesAsync(
        string? tenantId,
        int? companyId,
        CancellationToken cancellationToken = default);
}
