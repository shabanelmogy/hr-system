using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.BuildingBlocks.Persistence.AuditTrail;

/// <summary>
/// Reads one module's <see cref="AuditTrailEntry"/> table through that module's own
/// DbContext. Registered per module with <c>AddErpAuditTrailSource</c>.
/// </summary>
public sealed class AuditTrailSource<TContext> : IAuditTrailSource
    where TContext : DbContext
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly TContext _context;

    public AuditTrailSource(TContext context, string moduleCode)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentException.ThrowIfNullOrWhiteSpace(moduleCode);
        _context = context;
        ModuleCode = moduleCode;
    }

    public string ModuleCode { get; }

    public async Task<IReadOnlyList<AuditTrailRecord>> ListAsync(
        AuditTrailFilter filter,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(filter);
        if (filter.Take <= 0)
            return [];

        var query = Scoped(filter.TenantId, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.EntityName))
            query = query.Where(entry => entry.EntityName == filter.EntityName);
        if (!string.IsNullOrWhiteSpace(filter.EntityKey))
            query = query.Where(entry => entry.EntityKey == filter.EntityKey);
        if (filter.Action is { } action)
            query = query.Where(entry => entry.Action == action);
        if (!string.IsNullOrWhiteSpace(filter.UserId))
            query = query.Where(entry => entry.UserId == filter.UserId);
        if (filter.FromUtc is { } fromUtc)
            query = query.Where(entry => entry.OccurredOnUtc >= fromUtc);
        if (filter.ToUtc is { } toUtc)
            query = query.Where(entry => entry.OccurredOnUtc <= toUtc);

        if (filter.After is { } after)
        {
            // Global order: OccurredOnUtc desc, ModuleCode asc, Id desc.
            var cursorTime = after.OccurredOnUtc;
            var moduleOrder = string.CompareOrdinal(ModuleCode, after.ModuleCode);
            if (moduleOrder > 0)
            {
                query = query.Where(entry => entry.OccurredOnUtc <= cursorTime);
            }
            else if (moduleOrder == 0)
            {
                var cursorId = after.Id;
                query = query.Where(entry =>
                    entry.OccurredOnUtc < cursorTime ||
                    (entry.OccurredOnUtc == cursorTime && entry.Id < cursorId));
            }
            else
            {
                query = query.Where(entry => entry.OccurredOnUtc < cursorTime);
            }
        }

        var rows = await query
            .OrderByDescending(entry => entry.OccurredOnUtc)
            .ThenByDescending(entry => entry.Id)
            .Take(filter.Take)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return rows.Select(ToRecord).ToArray();
    }

    public async Task<AuditTrailRecordDetails?> GetAsync(
        long id,
        string? tenantId,
        int? companyId,
        CancellationToken cancellationToken = default)
    {
        var row = await Scoped(tenantId, companyId)
            .Where(entry => entry.Id == id)
            .FirstOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);
        if (row is null)
            return null;

        var changes = JsonSerializer.Deserialize<List<AuditFieldChange>>(row.ChangesJson, JsonOptions) ?? [];
        return new AuditTrailRecordDetails(ToRecord(row), changes);
    }

    public async Task<IReadOnlyList<string>> ListEntityNamesAsync(
        string? tenantId,
        int? companyId,
        CancellationToken cancellationToken = default) =>
        await Scoped(tenantId, companyId)
            .Select(entry => entry.EntityName)
            .Distinct()
            .OrderBy(name => name)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

    private IQueryable<AuditTrailEntry> Scoped(string? tenantId, int? companyId)
    {
        var query = _context.Set<AuditTrailEntry>().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(tenantId))
            query = query.Where(entry => entry.TenantId == tenantId);
        if (companyId is { } company)
            query = query.Where(entry => entry.CompanyId == null || entry.CompanyId == company);
        return query;
    }

    private AuditTrailRecord ToRecord(AuditTrailEntry entry) => new(
        ModuleCode,
        entry.Id,
        entry.TenantId,
        entry.CompanyId,
        entry.EntityName,
        entry.EntityKey,
        entry.EntityDisplay,
        entry.Action,
        entry.UserId,
        DateTime.SpecifyKind(entry.OccurredOnUtc, DateTimeKind.Utc),
        entry.CorrelationId,
        entry.ChangeCount);
}
