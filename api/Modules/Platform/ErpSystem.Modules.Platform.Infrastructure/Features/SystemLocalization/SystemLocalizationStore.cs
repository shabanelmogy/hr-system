using System.Text.Json;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Application.Features.SystemLocalization;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.Localization;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums;
namespace ErpSystem.Modules.Platform.Infrastructure.Features.SystemLocalization;
public sealed class SystemLocalizationStore(PlatformDbContext db, ICurrentActor actor, IHttpContextAccessor http, ICompanyUiCatalog catalog,
 IRoleLockResourceFactory locks, TimeProvider clock, SystemLocalizationErrors errors) : ISystemLocalizationStore
{
 private bool IsGlobal => !string.IsNullOrWhiteSpace(actor.UserId) && actor.IsInRole(PlatformRoleNames.SuperAdmin);
 private bool Has(string permission) => http.HttpContext?.User.HasClaim(PermissionClaimNames.Permission, permission) == true;
 private bool CanUse(CompanyUiText text) => IsGlobal && text.SystemPermissions is not null && text.SystemPermissions.All(Has);
 private bool CanView => IsGlobal && Has(PlatformPermissions.ViewSystemUiTexts);
 private Task<SystemLocalizationSettings?> Load(CancellationToken token) => db.SystemLocalizationSettings.AsNoTracking().Include(x=>x.Overrides).SingleOrDefaultAsync(token);
 public async Task<SystemLocalizationSettingsResponse?> GetSettingsAsync(CancellationToken token) {
  if(!CanView)return null; var state=await Load(token);
  return new(state?.Revision??0,["en","ar"],catalog.Sources.Where(x=>x.Entries.Any(CanUse)).Select(x=>new CompanyUiSourceInfo(x.Id,x.Client,x.Namespace)).ToArray(),new Dictionary<string,string>{{"web",catalog.GetVersion("web")},{"mobile",catalog.GetVersion("mobile")}});
 }
 public async Task<CompanyLocalizationTextsResponse?> GetTextsAsync(CompanyLocalizationTextsQuery query,CancellationToken token) {
  if(!CanView)return null;var source=catalog.Sources.SingleOrDefault(x=>x.Id==query.Source);if(source is null||!source.Entries.Any(CanUse))return null;
  var state=await Load(token);var values=(state?.Overrides??[]).Where(x=>x.Source==source.Id&&x.Language==query.TargetLanguage).ToDictionary(x=>x.Key,x=>x.Value,StringComparer.Ordinal);var search=query.Search?.Trim()??"";
  var rows=source.Entries.Where(CanUse).Select(text=>{var customized=values.TryGetValue(text.Key,out var value);var shipped=CompanyLocalizationValidation.Shipped(text,query.TargetLanguage);return new CompanyLocalizationTextRow(text.Key,CompanyLocalizationValidation.Shipped(text,query.BaseLanguage),value??shipped,shipped,customized);})
   .Where(x=>(query.Status!="customized"||x.IsCustomized)&&(query.Status!="missing"||!x.IsCustomized)&&(search.Length==0||x.Key.Contains(search,StringComparison.OrdinalIgnoreCase)||x.BaseValue.Contains(search,StringComparison.OrdinalIgnoreCase)||x.TargetValue.Contains(search,StringComparison.OrdinalIgnoreCase))).OrderBy(x=>x.Key,StringComparer.Ordinal).ToArray();
  return new(state?.Revision??0,rows.Skip((query.Page-1)*query.PageSize).Take(query.PageSize).ToArray(),rows.Length,query.Page,query.PageSize,catalog.GetVersion(source.Client));
 }
 public async Task<SystemLocalizationRuntimeResponse?> GetRuntimeAsync(string client,CancellationToken token) {
  if(!IsGlobal)return null;var state=await Load(token);var sources=catalog.Sources.Where(x=>x.Client==client).ToDictionary(x=>x.Id,StringComparer.Ordinal);
  var values=(state?.Overrides??[]).Where(x=>sources.ContainsKey(x.Source)&&sources[x.Source].Entries.Any(text=>text.Key==x.Key&&CanUse(text)&&CompanyLocalizationTextPolicy.HasMatchingPlaceholders(CompanyLocalizationValidation.Shipped(text,x.Language),x.Value)))
   .Select(x=>new CompanyLocalizationRuntimeOverride(sources[x.Source].Namespace,x.Language,x.Key,x.Value)).ToArray();return new(state?.Revision??0,catalog.GetVersion(client),values);
 }
 public async Task<Result> ApplyAsync(CompanyLocalizationChange change,CancellationToken token) {
  var grant=change.Kind==CompanyLocalizationChangeKind.SetText?PlatformPermissions.EditSystemUiTexts:PlatformPermissions.ResetSystemUiTexts;
  if(!CanView||!Has(grant)||change.Kind is not(CompanyLocalizationChangeKind.SetText or CompanyLocalizationChangeKind.ResetText)||CompanyLocalizationValidation.Find(catalog,change.Source,change.Key) is not {} text||!CanUse(text))return Result.Failure(errors.Forbidden);
  if(change.ExpectedRevision<0||!CompanyLocalizationValidation.IsLanguage(change.Language)||!CompanyLocalizationValidation.IsIdentifier(change.Source,100)||!CompanyLocalizationValidation.IsIdentifier(change.Key,400)||change.Kind==CompanyLocalizationChangeKind.SetText&&(string.IsNullOrWhiteSpace(change.Value)||change.Value.Length>4000||!CompanyLocalizationTextPolicy.HasMatchingPlaceholders(CompanyLocalizationValidation.Shipped(text,change.Language),change.Value)))return Result.Failure(errors.Invalid);
  try{return await db.ExecuteAtomicallyAsync([locks.Create("system","ui-localization")],async ct=>{
   if(!CanView||!Has(grant)||!CanUse(text))return Result.Failure(errors.Forbidden);
   var state=await db.SystemLocalizationSettings.Include(x=>x.Overrides).SingleOrDefaultAsync(ct);if((state?.Revision??0)!=change.ExpectedRevision)return Result.Failure(errors.Conflict);var created=state is null;state??=new();
   var previous=state.Overrides.SingleOrDefault(x=>x.Source==change.Source&&x.Language==change.Language&&x.Key==change.Key)?.Value;
   if(change.Kind==CompanyLocalizationChangeKind.SetText&&state.Overrides.Count>=5000&&previous is null)return Result.Failure(errors.Invalid);
   var changed=change.Kind==CompanyLocalizationChangeKind.SetText?state.SetText(change.Source,change.Language,change.Key,change.Value,change.ExpectedRevision):state.ResetText(change.Source,change.Language,change.Key,change.ExpectedRevision);
   if(!changed)return Result.Success();if(created)db.SystemLocalizationSettings.Add(state);
   db.SecurityAuditEvents.Add(new SecurityAuditEvent(Guid.NewGuid(),"SystemLocalizationUpdated","SystemLocalizationSettings",SecurityAuditOutcome.Succeeded,clock.GetUtcNow().UtcDateTime,null,null,actor.UserId,"1",null,null,null,actor.CorrelationId,JsonSerializer.Serialize(new{change.Kind,change.Source,change.Language,change.Key,PreviousValue=previous,CurrentValue=change.Kind==CompanyLocalizationChangeKind.SetText?change.Value:null,state.Revision})));
   await db.SaveChangesAsync(ct);return Result.Success();},token);}catch(DbUpdateConcurrencyException){db.ChangeTracker.Clear();return Result.Failure(errors.Conflict);}
 }
}
