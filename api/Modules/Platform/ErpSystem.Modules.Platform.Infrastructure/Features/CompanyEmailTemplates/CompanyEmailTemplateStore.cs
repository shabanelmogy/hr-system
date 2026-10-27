using System.Text.Json;
using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;

public sealed class CompanyEmailTemplateStore(PlatformDbContext db, ICurrentActor actor, IRoleLockResourceFactory locks,
    TimeProvider clock, CompanyEmailTemplateErrors errors) : ICompanyEmailTemplateReader, ICompanyEmailTemplateWriter
{
    public static IReadOnlyList<EmailTemplateVariable> Variables { get; } = Array.AsReadOnly<EmailTemplateVariable>([
        new("{FIRST_NAME}", "First name", "Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø£ÙˆÙ„", "Alex", true, false),
        new("{ACTION_URL}", "Account action link", "Ø±Ø§Ø¨Ø· Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨", "https://example.invalid/account-action", false, true)
    ]);
    public async Task<bool> HasScopeAsync(CancellationToken token) =>
        !actor.IsInRole("super_admin") && !string.IsNullOrWhiteSpace(actor.UserId) && !string.IsNullOrWhiteSpace(actor.TenantId) && actor.CompanyId is >0 &&
        await db.Companies.AsNoTracking().AnyAsync(item => item.Id == actor.CompanyId && item.IsActive, token) &&
        await db.UserTenantAccesses.AsNoTracking().AnyAsync(item => item.UserId == actor.UserId, token) &&
        await db.UserCompanyAccesses.AsNoTracking().AnyAsync(item => item.UserId == actor.UserId, token);

    public async Task<CompanyEmailTemplatePage?> ReadAsync(EmailTemplateCriteria criteria, CancellationToken token)
    {
        if (!await HasScopeAsync(token)) return null;
        var settings = await db.CompanyEmailTemplateSettings.AsNoTracking().Include(item => item.Templates).SingleOrDefaultAsync(token);
        var search = criteria.Search?.Trim() ?? string.Empty;
        var rows = AccountEmailCatalog.Definitions.Select(definition =>
        {
            var custom = settings?.Templates.SingleOrDefault(item => item.TemplateId == definition.Id && item.Language == criteria.Language);
            return new CompanyEmailTemplateRow(definition.Id, definition.NameEn, definition.NameAr, criteria.Language,
                custom?.Subject ?? definition.Subject(criteria.Language), custom?.Body ?? definition.Body(criteria.Language),
                custom is not null, settings?.Revision ?? 0, Variables);
        }).Where(item => (criteria.Status != "customized" || item.IsCustomized) && (criteria.Status != "default" || !item.IsCustomized) &&
            (search.Length == 0 || item.Id.Contains(search, StringComparison.OrdinalIgnoreCase) || item.NameEn.Contains(search, StringComparison.OrdinalIgnoreCase) ||
            item.NameAr.Contains(search, StringComparison.OrdinalIgnoreCase) || item.Subject.Contains(search, StringComparison.OrdinalIgnoreCase)))
            .OrderBy(item => item.Id, StringComparer.Ordinal).ToArray();
        return new(rows.Skip((criteria.Page - 1) * criteria.PageSize).Take(criteria.PageSize).ToArray(), rows.Length, criteria.Page, criteria.PageSize, settings?.Revision ?? 0);
    }

    public async Task<Result> ChangeAsync(string id, string language, string? subject, string? body, int expectedRevision, bool reset, CancellationToken token)
    {
        if (!await HasScopeAsync(token)) return Result.Failure(errors.Forbidden);
        try
        {
            return await db.ExecuteAtomicallyAsync([locks.Create(actor.TenantId!, "company-email-templates:" + actor.CompanyId!.Value.ToString(CultureInfo.InvariantCulture))], async cancellation =>
            {
                if (!await HasScopeAsync(cancellation)) return Result.Failure(errors.Forbidden);
                var settings = await db.CompanyEmailTemplateSettings.Include(item => item.Templates).SingleOrDefaultAsync(cancellation);
                if ((settings?.Revision ?? 0) != expectedRevision) return Result.Failure(errors.Conflict);
                var created = settings is null;
                settings ??= new CompanyEmailTemplateSettings(actor.TenantId!, actor.CompanyId!.Value);
                var previous = settings.Templates.SingleOrDefault(item => item.TemplateId == id && item.Language == language);
                var before = previous is null ? null : new { previous.Subject, previous.Body };
                if (!settings.Change(id, language, subject, body, expectedRevision, reset)) return Result.Success();
                if (created) db.CompanyEmailTemplateSettings.Add(settings);
                db.SecurityAuditEvents.Add(new SecurityAuditEvent(Guid.NewGuid(), reset ? "CompanyEmailTemplateReset" : "CompanyEmailTemplateChanged",
                    "CompanyEmailTemplateSettings", SecurityAuditOutcome.Succeeded, clock.GetUtcNow().UtcDateTime,
                    actor.TenantId, actor.CompanyId, actor.UserId, id, null, null, null, actor.CorrelationId,
                    JsonSerializer.Serialize(new { TemplateId = id, Language = language, Before = before, Subject = subject, Body = body, settings.Revision })));
                await db.SaveChangesAsync(cancellation);
                return Result.Success();
            }, token);
        }
        catch (DbUpdateConcurrencyException) { db.ChangeTracker.Clear(); return Result.Failure(errors.Conflict); }
    }
}

public sealed class AccountEmailScopeResolver(PlatformDbContext db, ICurrentActor actor, CompanyEmailTemplateStore scopedStore) : IAccountEmailScopeResolver
{
    public async Task<AccountEmailScope?> ResolveAsync(string? trustedTenantId, int? trustedCompanyId, string? recipientUserId, CancellationToken token)
    {
        if (!string.IsNullOrWhiteSpace(trustedTenantId) && trustedCompanyId is >0 &&
            await db.Companies.IgnoreQueryFilters().AsNoTracking().AnyAsync(item => item.TenantId == trustedTenantId && item.Id == trustedCompanyId && item.IsActive && item.DeletedOn == null, token))
        return new(trustedTenantId, trustedCompanyId.Value);
        else if (trustedTenantId is null && trustedCompanyId is null && recipientUserId is not null && actor.UserId == recipientUserId && await scopedStore.HasScopeAsync(token))
        return new(actor.TenantId!, actor.CompanyId!.Value);
        return null;
    }
}

public sealed class AccountEmailRenderer(PlatformDbContext db, IAccountEmailScopeResolver scopeResolver, IAccountEmailContentPolicy policy) : IAccountEmailRenderer
{
    public async Task<RenderedAccountEmail> RenderAsync(string templateId, string language, string name, string actionUrl,
        string? trustedTenantId, int? trustedCompanyId, CancellationToken token, string? recipientUserId = null)
    {
        var definition = AccountEmailCatalog.Find(templateId) ?? throw new ArgumentException("Unknown account email template.");
        if (!AccountEmailCatalog.IsLanguage(language)) language = "en";
        var scope = await scopeResolver.ResolveAsync(trustedTenantId, trustedCompanyId, recipientUserId, token);
        var tenantId = scope?.TenantId; var companyId = scope?.CompanyId;
        CompanyEmailTemplateOverride? custom = null;
        if (tenantId is not null && companyId is >0)
        {
            // Explicitly trusted server-only scope; never bound from an anonymous request.
            var settings = await db.CompanyEmailTemplateSettings.IgnoreQueryFilters().AsNoTracking().Include(item => item.Templates)
                .SingleOrDefaultAsync(item => item.TenantId == tenantId && item.CompanyId == companyId, token);
            custom = settings?.Templates.SingleOrDefault(item => item.TemplateId == templateId && item.Language == language);
        }
        return policy.Render(custom?.Subject ?? definition.Subject(language), custom?.Body ?? definition.Body(language), language, name, actionUrl);
    }
}
