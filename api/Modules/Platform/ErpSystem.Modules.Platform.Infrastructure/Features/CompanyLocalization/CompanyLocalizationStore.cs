using System.Globalization;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.CompanyLocalization;

public sealed class CompanyLocalizationStore(PlatformDbContext db, ICurrentActor actor,
    ICompanyUiCatalog catalog, IRoleLockResourceFactory locks, TimeProvider clock, CompanyLocalizationErrors errors,
    IRealtimeChangeDispatcher realtimeChanges, ILogger<CompanyLocalizationStore> logger)
    : ICompanyLocalizationStore
{
    public async Task<CompanyLocalizationSettingsResponse?> GetSettingsAsync(CancellationToken token)
    {
        if (!await HasScopeAsync(token)) return null;
        var settings = await LoadAsync(token);
        return new(actor.TenantId!, actor.CompanyId!.Value, settings?.DefaultLanguage ?? "en", settings?.Revision ?? 0,
            ["en","ar"], catalog.Sources.Where(source => source.Entries.Any(CompanyLocalizationValidation.IsCompanyText))
                .Select(source => new CompanyUiSourceInfo(source.Id, source.Client, source.Namespace)).ToArray(),
            new Dictionary<string,string> { ["web"] = catalog.GetVersion("web"), ["mobile"] = catalog.GetVersion("mobile") });
    }

    public async Task<CompanyLocalizationTextsResponse?> GetTextsAsync(CompanyLocalizationTextsQuery query, CancellationToken token)
    {
        if (!await HasScopeAsync(token)) return null;
        var source = catalog.Sources.SingleOrDefault(item => item.Id == query.Source);
        if (source is null || !source.Entries.Any(CompanyLocalizationValidation.IsCompanyText)) return null;
        var settings = await LoadAsync(token);
        var overrides = (settings?.Overrides ?? []).Where(item => item.Source == source.Id && item.Language == query.TargetLanguage)
            .ToDictionary(item => item.Key, item => item.Value, StringComparer.Ordinal);
        var search = query.Search?.Trim() ?? string.Empty;
        var rows = source.Entries.Where(CompanyLocalizationValidation.IsCompanyText).Select(text =>
        {
            var customized = overrides.TryGetValue(text.Key, out var value);
            var shipped = CompanyLocalizationValidation.Shipped(text, query.TargetLanguage);
            return new CompanyLocalizationTextRow(text.Key, CompanyLocalizationValidation.Shipped(text, query.BaseLanguage), value ?? shipped, shipped, customized);
        }).Where(row => (query.Status != "customized" || row.IsCustomized) && (query.Status != "missing" || !row.IsCustomized)
            && (search.Length == 0 || row.Key.Contains(search,StringComparison.OrdinalIgnoreCase)
                || row.BaseValue.Contains(search,StringComparison.OrdinalIgnoreCase) || row.TargetValue.Contains(search,StringComparison.OrdinalIgnoreCase)))
            .OrderBy(row => row.Key,StringComparer.Ordinal).ToArray();
        return new(settings?.Revision ?? 0, rows.Skip((query.Page-1)*query.PageSize).Take(query.PageSize).ToArray(),
            rows.Length, query.Page, query.PageSize, catalog.GetVersion(source.Client));
    }

    public async Task<CompanyLocalizationRuntimeResponse?> GetRuntimeAsync(string client, CancellationToken token)
    {
        if (!await HasScopeAsync(token)) return null;
        var settings = await LoadAsync(token);
        var sources = catalog.Sources.Where(source => source.Client == client).ToDictionary(source => source.Id,StringComparer.Ordinal);
        // Removed/renamed keys and incompatible placeholder contracts are dormant, never shipped to a client.
        var overrides = (settings?.Overrides ?? []).Where(item => sources.ContainsKey(item.Source))
            .Where(item => sources[item.Source].Entries.Any(text => text.Key == item.Key && CompanyLocalizationValidation.IsCompanyText(text) &&
                CompanyLocalizationTextPolicy.HasMatchingPlaceholders(CompanyLocalizationValidation.Shipped(text,item.Language),item.Value)))
            .Select(item => new CompanyLocalizationRuntimeOverride(sources[item.Source].Namespace,item.Language,item.Key,item.Value)).ToArray();
        return new(actor.TenantId!,actor.CompanyId!.Value,settings?.DefaultLanguage ?? "en",settings?.Revision ?? 0,catalog.GetVersion(client),overrides);
    }

    public async Task<Result> ApplyAsync(CompanyLocalizationChange change, CancellationToken token)
    {
        if (!await HasScopeAsync(token)) return Result.Failure(errors.Forbidden);
        if ((change.Kind is CompanyLocalizationChangeKind.SetText or CompanyLocalizationChangeKind.ResetText) &&
            (CompanyLocalizationValidation.Find(catalog, change.Source!, change.Key!) is not { } text ||
             !CompanyLocalizationValidation.IsCompanyText(text)))
            return Result.Failure(errors.Forbidden);
        var tenantId = actor.TenantId!;
        var companyId = actor.CompanyId!.Value;
        var committedChange = false;
        try
        {
            var result = await db.ExecuteAtomicallyAsync([locks.Create(actor.TenantId!,
                "company-localization:" + actor.CompanyId!.Value.ToString(CultureInfo.InvariantCulture))], async cancellation =>
            {
                committedChange = false;
                if (!await HasScopeAsync(cancellation)) return Result.Failure(errors.Forbidden);
                var settings = await db.CompanyLocalizationSettings.Include(item => item.Overrides).SingleOrDefaultAsync(cancellation);
                if ((settings?.Revision ?? 0) != change.ExpectedRevision) return Result.Failure(errors.Conflict);
                var created = settings is null;
                settings ??= new CompanyLocalizationSettings(actor.TenantId!,actor.CompanyId!.Value);
                var previousDefault = settings.DefaultLanguage;
                var previousValue = settings.Overrides.SingleOrDefault(item => item.Source == change.Source && item.Language == change.Language && item.Key == change.Key)?.Value;
                if (change.Kind == CompanyLocalizationChangeKind.SetText && settings.Overrides.Count >= 5000 &&
                    !settings.Overrides.Any(item => item.Source == change.Source && item.Language == change.Language && item.Key == change.Key))
                    return Result.Failure(errors.Invalid);
                var changed = change.Kind switch
                {
                    CompanyLocalizationChangeKind.SetDefault => settings.SetDefaultLanguage(change.Language,change.ExpectedRevision),
                    CompanyLocalizationChangeKind.SetText => settings.SetText(change.Source,change.Language,change.Key,change.Value,change.ExpectedRevision),
                    CompanyLocalizationChangeKind.ResetText => settings.ResetText(change.Source,change.Language,change.Key,change.ExpectedRevision),
                    _ => throw new ArgumentException("Unknown localization change."),
                };
                if (!changed) return Result.Success();
                if (created) db.CompanyLocalizationSettings.Add(settings);
                db.SecurityAuditEvents.Add(new SecurityAuditEvent(Guid.NewGuid(),"CompanyLocalizationUpdated",
                    "CompanyLocalizationSettings",SecurityAuditOutcome.Succeeded,clock.GetUtcNow().UtcDateTime,
                    actor.TenantId,actor.CompanyId,actor.UserId,actor.CompanyId!.Value.ToString(CultureInfo.InvariantCulture),
                    null,null,null,actor.CorrelationId,
                    JsonSerializer.Serialize(new { change.Kind, change.Source, change.Language, change.Key, PreviousValue = previousValue,
                        CurrentValue = change.Kind == CompanyLocalizationChangeKind.SetText ? change.Value : null,
                        PreviousDefault = previousDefault, settings.DefaultLanguage, settings.Revision })));
                await db.SaveChangesAsync(cancellation);
                committedChange = true;
                return Result.Success();
            },token);
            if (result.IsSuccess && committedChange)
            {
                try
                {
                    realtimeChanges.Dispatch(new RealtimeChangeRequest(RealtimeAudience.ForCompany(tenantId, companyId),
                        "company-localizations", "Update", companyId.ToString(CultureInfo.InvariantCulture), Guid.NewGuid()));
                }
                catch (Exception exception)
                {
                    // A transient invalidation failure cannot undo the committed settings/audit.
                    // Runtime clients also refresh periodically and on reconnect.
                    logger.LogError(exception, "Post-commit company localization invalidation failed for {TenantId}/{CompanyId}", tenantId, companyId);
                }
            }
            return result;
        }
        catch (DbUpdateConcurrencyException)
        {
            db.ChangeTracker.Clear();
            return Result.Failure(errors.Conflict);
        }
    }

    private Task<CompanyLocalizationSettings?> LoadAsync(CancellationToken token) =>
        db.CompanyLocalizationSettings.AsNoTracking().Include(item => item.Overrides).SingleOrDefaultAsync(token);

    private async Task<bool> HasScopeAsync(CancellationToken token) =>
        !string.IsNullOrWhiteSpace(actor.UserId) && !string.IsNullOrWhiteSpace(actor.TenantId) && actor.CompanyId is >0 &&
        await db.Companies.AsNoTracking().AnyAsync(item => item.Id == actor.CompanyId && item.IsActive,token) &&
        await db.UserTenantAccesses.AsNoTracking().AnyAsync(item => item.UserId == actor.UserId,token) &&
        await db.UserCompanyAccesses.AsNoTracking().AnyAsync(item => item.UserId == actor.UserId,token);
}
