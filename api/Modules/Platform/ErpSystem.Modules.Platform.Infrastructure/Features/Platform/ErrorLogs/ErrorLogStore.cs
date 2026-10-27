using System.Text.Json;
using ClosedXML.Excel;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;

public sealed class ErrorLogStore(PlatformDbContext db, ErrorLogCaptureQueue queue, TimeProvider clock) : IErrorLogStore
{
    public async Task<bool> HasCompanyScopeAsync(string? userId, string? tenantId, int? companyId, CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(tenantId) || companyId is null or <= 0)
            return false;
        var tenantActive = await db.Tenants.AsNoTracking().AnyAsync(x => x.Id == tenantId && x.IsActive && x.ArchivedOn == null, token);
        var companyActive = await db.Companies.IgnoreQueryFilters().AsNoTracking()
            .AnyAsync(x => x.Id == companyId && x.TenantId == tenantId && x.IsActive && x.DeletedOn == null, token);
        var userActive = await db.Users.AsNoTracking().AnyAsync(x => x.Id == userId && !x.IsDisabled && x.ArchivedOn == null, token);
        var tenantAccess = await db.UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
            .AnyAsync(x => x.UserId == userId && x.TenantId == tenantId, token);
        var companyAccess = await db.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking()
            .AnyAsync(x => x.UserId == userId && x.TenantId == tenantId && x.CompanyId == companyId, token);
        return tenantActive && companyActive && userActive && tenantAccess && companyAccess;
    }

    public async Task<ErrorLogPage> ListAsync(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId, CancellationToken token)
    {
        var query = Filter(criteria, system, tenantId, companyId);
        var total = await query.CountAsync(token);
        var items = await ReadRows(query.Skip((criteria.Page - 1) * criteria.PageSize).Take(criteria.PageSize), system, token);
        return new ErrorLogPage(items, total, criteria.Page, criteria.PageSize);
    }

    public async Task<ErrorLogDetail?> DetailAsync(Guid id, bool system, string? tenantId, int? companyId, CancellationToken token)
    {
        var entry = await Scope(system, tenantId, companyId).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, token);
        if (entry is null) return null;
        var userName = entry.UserId is null ? null : await db.Users.AsNoTracking().Where(x => x.Id == entry.UserId).Select(x => x.UserName).SingleOrDefaultAsync(token);
        IReadOnlyList<string> diagnostics = [];
        if (system && !string.IsNullOrWhiteSpace(entry.MethodFramesJson))
        {
            try { diagnostics = JsonSerializer.Deserialize<string[]>(entry.MethodFramesJson) ?? []; }
            catch (JsonException) { diagnostics = []; }
        }
        return new ErrorLogDetail(ToRow(entry, userName, system), diagnostics);
    }

    public async Task<ErrorLogExport?> ExportAsync(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId, CancellationToken token)
    {
        var query = Filter(criteria, system, tenantId, companyId);
        if (await query.Take(5001).CountAsync(token) > 5000) return null;
        var rows = await ReadRows(query.Take(5000), system, token);
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Error Logs");
        var headers = new[] { "Occurred UTC", "Source", "Severity", "User", "Service", "Action", "Status", "Duration ms", "Correlation", "Summary", "Client", "Browser", "IP address" };
        for (var col = 0; col < headers.Length; col++) sheet.Cell(1, col + 1).Value = headers[col];
        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i]; var values = new[] { row.OccurredOnUtc.ToString("O"), row.Source, row.Severity,
                row.UserName ?? "", row.Service ?? "", row.Action ?? "", row.StatusCode?.ToString() ?? "",
                row.DurationMs?.ToString() ?? "", row.CorrelationId ?? "", row.Summary,
                row.Client ?? "", row.Browser ?? "", row.IpAddress ?? "" };
            for (var col = 0; col < values.Length; col++) sheet.Cell(i + 2, col + 1).Value = ExcelSafe(values[col]);
        }
        sheet.Row(1).Style.Font.Bold = true;
        using var stream = new MemoryStream(); workbook.SaveAs(stream);
        return new ErrorLogExport(stream.ToArray(), "error-logs.xlsx");
    }

    public async Task<ErrorLogSettingsResponse> GetSettingsAsync(CancellationToken token)
    {
        var value = await db.ErrorLogRetentionSettings.AsNoTracking().SingleOrDefaultAsync(token);
        return Response(value);
    }

    public async Task<ErrorLogSettingsResponse?> UpdateSettingsAsync(int days, long expectedRevision, string? actorUserId, CancellationToken token)
    {
        try
        {
            return await db.ExecuteAtomicallyAsync(["error-log-settings"], async cancellation =>
            {
                var value = await db.ErrorLogRetentionSettings.SingleOrDefaultAsync(cancellation);
                if (value is null || value.Revision != expectedRevision) return null;
                var previousDays = value.RetentionDays;
                if (!value.Change(days, expectedRevision)) return Response(value);
                var auditMetadata = JsonSerializer.Serialize(new { PreviousDays = previousDays, RetentionDays = days,
                    PreviousRevision = expectedRevision, Revision = value.Revision });
                db.SecurityAuditEvents.Add(new SecurityAuditEvent(Guid.NewGuid(), "ErrorLogSettings.Edit", "ErrorLogRetentionSettings",
                    SecurityAuditOutcome.Succeeded, clock.GetUtcNow().UtcDateTime, null, null, actorUserId,
                    "1", null, null, null, null, auditMetadata));
                await db.SaveChangesAsync(cancellation);
                return Response(value);
            }, token);
        }
        catch (DbUpdateConcurrencyException) { db.ChangeTracker.Clear(); return null; }
    }

    private ErrorLogSettingsResponse Response(ErrorLogRetentionSettings? value) =>
        new(value?.RetentionDays ?? 90, value?.Revision ?? 0, queue.Depth, queue.Dropped, queue.FailedWrites);

    private IQueryable<ErrorLogEntry> Scope(bool system, string? tenantId, int? companyId) => system
        ? db.ErrorLogEntries.IgnoreQueryFilters()
        : db.ErrorLogEntries.IgnoreQueryFilters().Where(x => x.TenantId == tenantId && x.CompanyId == companyId);

    private IQueryable<ErrorLogEntry> Filter(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId)
    {
        var query = Scope(system, tenantId, companyId).AsNoTracking();
        if (criteria.FromUtc is { } from) query = query.Where(x => x.OccurredOnUtc >= from);
        if (criteria.ToUtc is { } to) query = query.Where(x => x.OccurredOnUtc <= to);
        if (criteria.Source is { } source) query = query.Where(x => x.Source == source);
        if (criteria.StatusCode is { } status) query = query.Where(x => x.StatusCode == status);
        if (!string.IsNullOrWhiteSpace(criteria.UserName))
            query = query.Where(x => db.Users.Any(u => u.Id == x.UserId && u.UserName != null && u.UserName.Contains(criteria.UserName)));
        if (!string.IsNullOrWhiteSpace(criteria.Search))
            query = query.Where(x => x.Summary.Contains(criteria.Search) ||
                (x.Service != null && x.Service.Contains(criteria.Search)) ||
                (x.Action != null && x.Action.Contains(criteria.Search)) ||
                (x.CorrelationId != null && x.CorrelationId.Contains(criteria.Search)));
        return query.OrderByDescending(x => x.OccurredOnUtc).ThenByDescending(x => x.Id);
    }

    private async Task<IReadOnlyList<ErrorLogRow>> ReadRows(IQueryable<ErrorLogEntry> query, bool system, CancellationToken token)
    {
        var entries = await query.ToListAsync(token);
        var ids = entries.Where(x => x.UserId != null).Select(x => x.UserId!).Distinct().ToArray();
        var names = await db.Users.AsNoTracking().Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.UserName, token);
        return entries.Select(x => ToRow(x, x.UserId != null && names.TryGetValue(x.UserId, out var name) ? name : null, system)).ToArray();
    }
    private static ErrorLogRow ToRow(ErrorLogEntry x, string? userName, bool system) => new(x.Id, DateTime.SpecifyKind(x.OccurredOnUtc, DateTimeKind.Utc),
        x.Source, x.Severity, userName, x.Service, x.Action, x.StatusCode, x.DurationMs,
        x.CorrelationId, x.Summary, x.Client, x.Browser, system ? x.IpAddress : null);
    private static string ExcelSafe(string value) => value.Length > 0 && value[0] is '=' or '+' or '-' or '@' ? "'" + value : value;
}
