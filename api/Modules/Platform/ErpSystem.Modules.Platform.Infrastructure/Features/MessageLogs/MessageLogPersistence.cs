using AngleSharp.Html.Parser;
using Ganss.Xss;
using ClosedXML.Excel;
using ErpSystem.Modules.Platform.Application.Features.MessageLogs;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Domain.Platform.MessageLogs;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.MessageLogs;

public sealed class MessageLogEntryConfiguration : IEntityTypeConfiguration<MessageLogEntry>
{
    public void Configure(EntityTypeBuilder<MessageLogEntry> builder)
    {
        builder.ToTable("MessageLogEntries", PlatformDbContext.Schema); builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).HasMaxLength(32); builder.Property(x => x.UserId).HasMaxLength(450);
        builder.Property(x => x.CorrelationId).HasMaxLength(128); builder.Property(x => x.TemplateId).HasMaxLength(64);
        builder.Property(x => x.Language).HasMaxLength(2); builder.Property(x => x.Type).HasMaxLength(16);
        builder.Property(x => x.Recipient).HasMaxLength(320); builder.Property(x => x.Subject).HasMaxLength(512);
        builder.Property(x => x.SnapshotHtml).HasMaxLength(65536); builder.Property(x => x.Status).HasMaxLength(16).IsConcurrencyToken();
        builder.Property(x => x.Phase).HasMaxLength(16); builder.Property(x => x.Cause).HasMaxLength(32);
        builder.HasOne<PlatformCompany>().WithMany().HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.StartedOnUtc, x.Id });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status, x.StartedOnUtc });
    }
}

public static class MessageSnapshotPolicy
{
    public static MessageAttemptSnapshot Redact(string subject, string html, string actionUrl)
    {
        // Redact both encodings before parsing; do not let a live account link reach persistence.
        html = html.Replace(System.Net.WebUtility.HtmlEncode(actionUrl), "", StringComparison.Ordinal)
            .Replace(actionUrl, "", StringComparison.Ordinal);
        var document = new HtmlParser().ParseDocument(html);
        foreach (var anchor in document.QuerySelectorAll("a")) anchor.RemoveAttribute("href");
        var sanitizer = new HtmlSanitizer(); sanitizer.AllowedTags.Clear(); sanitizer.AllowedAttributes.Clear();
        foreach (var tag in new[] { "p", "br", "strong", "em", "u", "s", "blockquote", "h1", "h2", "h3", "ul", "ol", "li", "hr", "a", "code", "pre", "span" }) sanitizer.AllowedTags.Add(tag);
        var snapshot = sanitizer.Sanitize(document.Body!.InnerHtml);
        subject = subject.Replace(actionUrl, "", StringComparison.Ordinal);
        var truncated = subject.Length > 512 || snapshot.Length > 65000;
        // Never split markup into malformed attributes. Fall back to encoded plain text if bounded HTML overflows.
        if (snapshot.Length > 65000)
        {
            var text = document.Body.TextContent;
            snapshot = "<p>" + System.Net.WebUtility.HtmlEncode(text[..Math.Min(text.Length, 8000)]) + "</p>";
        }
        var language = document.DocumentElement.GetAttribute("lang") == "ar" ? "ar" : "en";
        snapshot = $"<!doctype html><html lang=\"{language}\" dir=\"{(language == "ar" ? "rtl" : "ltr")}\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head><body>{snapshot}</body></html>";
        return new(subject[..Math.Min(subject.Length, 512)], snapshot, truncated);
    }
}

public sealed class MessageLogReader(PlatformDbContext db, ICurrentActor actor, ICompanyAccessService companyAccess) : IMessageLogReader
{
    public async Task<bool> HasScopeAsync(CancellationToken token) =>
        !actor.IsInRole("super_admin") && !string.IsNullOrWhiteSpace(actor.UserId) && !string.IsNullOrWhiteSpace(actor.TenantId) && actor.CompanyId is > 0 &&
        await db.Users.AsNoTracking().AnyAsync(x => x.Id == actor.UserId && !x.IsDisabled && x.ArchivedOn == null, token) &&
        await db.Tenants.AsNoTracking().AnyAsync(x => x.Id == actor.TenantId && x.IsActive && x.ArchivedOn == null, token) &&
        await companyAccess.GetAvailableCompanyAsync(actor.UserId, actor.TenantId, actor.CompanyId.Value, token) is not null;
    private IQueryable<MessageLogEntry> Scope() => db.MessageLogEntries.AsNoTracking()
        .Where(x => x.TenantId == actor.TenantId && x.CompanyId == actor.CompanyId);
    private IQueryable<MessageLogEntry> Filter(MessageLogCriteria criteria)
    {
        var query = Scope();
        if (criteria.FromUtc is { } from) query = query.Where(x => x.StartedOnUtc >= from);
        if (criteria.ToUtc is { } to) query = query.Where(x => x.StartedOnUtc <= to);
        if (criteria.Status is { } status) query = query.Where(x => x.Status == status);
        if (criteria.TemplateId is { } template) query = query.Where(x => x.TemplateId == template);
        if (!string.IsNullOrWhiteSpace(criteria.Recipient)) query = query.Where(x => x.Recipient.Contains(criteria.Recipient));
        if (!string.IsNullOrWhiteSpace(criteria.Search)) query = query.Where(x => x.Subject.Contains(criteria.Search) || x.Recipient.Contains(criteria.Search) ||
            x.TemplateId.Contains(criteria.Search) || (x.CorrelationId != null && x.CorrelationId.Contains(criteria.Search)));
        return query.OrderByDescending(x => x.StartedOnUtc).ThenByDescending(x => x.Id);
    }
    public async Task<MessageLogPage> ListAsync(MessageLogCriteria criteria, CancellationToken token)
    {
        var query = Filter(criteria); var count = await query.CountAsync(token);
        var rows = await query.Skip((criteria.Page - 1) * criteria.PageSize).Take(criteria.PageSize).Select(x => new MessageLogRow(
            x.Id, x.StartedOnUtc, x.CompletedOnUtc, x.DurationMs, x.Type, x.TemplateId, x.Language, x.Recipient, x.Subject,
            x.Status, x.Phase, x.Cause, x.SmtpStatusCode, x.CorrelationId, x.SnapshotTruncated)).ToArrayAsync(token);
        return new(rows.Select(row => row with { StartedOnUtc = DateTime.SpecifyKind(row.StartedOnUtc, DateTimeKind.Utc),
            CompletedOnUtc = row.CompletedOnUtc is { } time ? DateTime.SpecifyKind(time, DateTimeKind.Utc) : null }).ToArray(), count, criteria.Page, criteria.PageSize);
    }
    public async Task<MessageLogDetail?> DetailAsync(Guid id, CancellationToken token)
    { var value = await Scope().SingleOrDefaultAsync(x => x.Id == id, token); return value is null ? null : new(Row(value), value.SnapshotHtml); }
    public async Task<MessageLogExport?> ExportAsync(MessageLogCriteria criteria, CancellationToken token)
    {
        var query = Filter(criteria); if (await query.Take(5001).CountAsync(token) > 5000) return null;
        var rows = await query.Take(5000).Select(x => new { x.StartedOnUtc, x.CompletedOnUtc, x.Type, x.TemplateId, x.Language, x.Recipient,
            x.Subject, x.Status, x.Phase, x.Cause, x.SmtpStatusCode, x.DurationMs, x.CorrelationId }).ToArrayAsync(token);
        using var workbook = new XLWorkbook(); var sheet = workbook.Worksheets.Add("Message Logs");
        string[] headers = ["Started UTC", "Completed UTC", "Type", "Template", "Language", "To", "Subject", "Status", "Phase", "Cause", "SMTP code", "Duration ms", "Correlation"];
        for (var col = 0; col < headers.Length; col++) sheet.Cell(1, col + 1).Value = headers[col];
        for (var i = 0; i < rows.Length; i++)
        {
            var row = rows[i]; string[] values = [row.StartedOnUtc.ToString("O"), row.CompletedOnUtc?.ToString("O") ?? "", row.Type, row.TemplateId,
                row.Language, row.Recipient, row.Subject, row.Status, row.Phase, row.Cause ?? "", row.SmtpStatusCode?.ToString(CultureInfo.InvariantCulture) ?? "",
                row.DurationMs?.ToString(CultureInfo.InvariantCulture) ?? "", row.CorrelationId ?? ""];
            for (var col = 0; col < values.Length; col++) sheet.Cell(i + 2, col + 1).Value = SafeCell(values[col]);
        }
        sheet.Row(1).Style.Font.Bold = true; using var stream = new MemoryStream(); workbook.SaveAs(stream);
        return new(stream.ToArray(), "message-logs.xlsx");
    }
    private static string SafeCell(string value) => value.TrimStart() is { Length: > 0 } text && "=+-@".Contains(text[0]) ? "'" + value : value;
    private static MessageLogRow Row(MessageLogEntry x) => new(x.Id, DateTime.SpecifyKind(x.StartedOnUtc, DateTimeKind.Utc),
        x.CompletedOnUtc is { } complete ? DateTime.SpecifyKind(complete, DateTimeKind.Utc) : null, x.DurationMs,
        x.Type, x.TemplateId, x.Language, x.Recipient, x.Subject, x.Status, x.Phase, x.Cause, x.SmtpStatusCode, x.CorrelationId, x.SnapshotTruncated);
}

public sealed class MessageAttemptRecorder(DbContextOptions<PlatformDbContext> options, ILogger<MessageAttemptRecorder> logger) : IMessageAttemptRecorder
{
    public async Task<Guid?> StartAsync(MessageAttemptStart attempt)
    {
        Guid? id = null;
        await TryAsync(async (db, token) =>
        {
            var value = MessageLogEntry.Start(Guid.NewGuid(), attempt.TenantId, attempt.CompanyId, attempt.UserId, attempt.CorrelationId,
                attempt.StartedOnUtc, attempt.TemplateId, attempt.Language, attempt.Recipient);
            db.MessageLogEntries.Add(value); await db.SaveChangesAsync(token); id = value.Id;
        });
        return id;
    }
    public Task SnapshotAsync(Guid id, MessageAttemptStart attempt, MessageAttemptSnapshot snapshot) => TryAsync(async (db, token) =>
    {
        var entry = await Find(db, id, attempt).SingleOrDefaultAsync(token);
        if (entry is null) return; entry.SetSnapshot(snapshot.Subject, snapshot.Html, snapshot.Truncated); await db.SaveChangesAsync(token);
    });
    public Task CompleteAsync(Guid id, MessageAttemptStart attempt, MessageAttemptCompletion completion) => TryAsync(async (db, token) =>
    {
        var entry = await Find(db, id, attempt).SingleOrDefaultAsync(token); if (entry is null) return;
        if (entry.Complete(completion.CompletedOnUtc < entry.StartedOnUtc ? entry.StartedOnUtc : completion.CompletedOnUtc,
            completion.DurationMs, completion.Status, completion.Phase, completion.Cause, completion.SmtpStatusCode)) await db.SaveChangesAsync(token);
    });
    private static IQueryable<MessageLogEntry> Find(PlatformDbContext db, Guid id, MessageAttemptStart attempt) =>
        db.MessageLogEntries.IgnoreQueryFilters().Where(x => x.Id == id && x.TenantId == attempt.TenantId && x.CompanyId == attempt.CompanyId);
    private async Task TryAsync(Func<PlatformDbContext, CancellationToken, Task> action)
    {
        try
        {
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            // Server-only verified attribution. Never reuse the caller's tracked context or transaction.
            await using var isolated = new PlatformDbContext(options);
            await action(isolated, timeout.Token);
        }
        catch (Exception error) { logger.LogWarning("A bounded message-history write did not complete ({FailureType}); mail delivery outcome is unchanged.", error.GetType().Name); }
    }
}
