using System.Security.Claims;
using ErpSystem.Modules.Platform.Application.Features.SystemLocalization;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Domain.Platform.Localization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Infrastructure.Features.SystemLocalization;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
namespace ErpSystem.Modules.Platform.Tests;
public sealed class SystemLocalizationTests
{
 [Fact] public void Revision_noop_and_reset_preserve_domain_contract() {
  var state=new SystemLocalizationSettings(); Assert.Equal(1,state.Id);
  Assert.True(state.SetText("web:core","ar","actions.save","حفظ",0));Assert.False(state.SetText("web:core","ar","actions.save","حفظ",1));
  Assert.Throws<InvalidOperationException>(()=>state.SetText("web:core","ar","actions.save","جديد",0));Assert.True(state.ResetText("web:core","ar","actions.save",1));Assert.False(state.ResetText("web:core","ar","actions.save",2));Assert.Equal(2,state.Revision);Assert.Empty(state.Overrides);
 }
 [Theory] [InlineData("fr","text")] [InlineData("en","")] [InlineData("ar"," ")]
 public void Invalid_domain_values_are_rejected(string language,string value) => Assert.Throws<ArgumentException>(()=>new SystemLocalizationSettings().SetText("web:core",language,"actions.save",value,0));
 [Fact] public async Task Target_permissions_filter_settings_search_and_runtime() {
  var actor=new Actor();await using var db=Db(actor);var catalog=new Catalog();
  var state=new SystemLocalizationSettings();state.SetText("web:test","ar","public","مخصص",0);state.SetText("web:test","ar","private","خاص",1);state.SetText("web:test","ar","removed","قديم",2);db.SystemLocalizationSettings.Add(state);await db.SaveChangesAsync();
  var http=Http(PlatformPermissions.ViewSystemUiTexts);var store=new SystemLocalizationStore(db,actor,http,catalog,new RoleLockResourceFactory(),TimeProvider.System,new SystemLocalizationErrors(new Localizer()));
  var settings=await store.GetSettingsAsync(default);Assert.Single(settings!.Sources);
  var rows=await store.GetTextsAsync(new("web:test"),default);Assert.Equal("public",Assert.Single(rows!.Items).Key);
  Assert.Empty((await store.GetTextsAsync(new("web:test",Search:"private"),default))!.Items);
  Assert.Equal("public",Assert.Single((await store.GetRuntimeAsync("web",default))!.Overrides).Key);
  http.HttpContext=Http("Target:View").HttpContext;
  Assert.Null(await store.GetSettingsAsync(default));Assert.Equal(2,(await store.GetRuntimeAsync("web",default))!.Overrides.Count);
 }
 [Theory] [InlineData(false,true)] [InlineData(true,false)]
 public async Task Mutation_requires_view_and_write_grants(bool view,bool edit) {
  var actor=new Actor();await using var db=Db(actor);var grants=new List<string>();if(view)grants.Add(PlatformPermissions.ViewSystemUiTexts);if(edit)grants.Add(PlatformPermissions.EditSystemUiTexts);
  var store=new SystemLocalizationStore(db,actor,Http(grants.ToArray()),new Catalog(),new RoleLockResourceFactory(),TimeProvider.System,new SystemLocalizationErrors(new Localizer()));
  Assert.True((await store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText,"ar",0,"web:test","public","جديد"),default)).IsFailure);Assert.Empty(db.SecurityAuditEvents);
 }
 [Fact] public async Task Forged_target_and_company_actor_are_denied() {
  var actor=new Actor();await using var db=Db(actor);var store=new SystemLocalizationStore(db,actor,Http(PlatformPermissions.ViewSystemUiTexts,PlatformPermissions.EditSystemUiTexts,PlatformPermissions.ResetSystemUiTexts),new Catalog(),new RoleLockResourceFactory(),TimeProvider.System,new SystemLocalizationErrors(new Localizer()));
  foreach(var kind in new[]{CompanyLocalizationChangeKind.SetText,CompanyLocalizationChangeKind.ResetText})Assert.True((await store.ApplyAsync(new(kind,"ar",0,"web:test","private","جديد"),default)).IsFailure);
  actor.Global=false;Assert.Null(await store.GetSettingsAsync(default));Assert.Null(await store.GetRuntimeAsync("web",default));Assert.Empty(db.SecurityAuditEvents);
 }
 [Fact] public void Embedded_policy_is_explicit_and_company_private_keys_fail_closed() {
  var catalog=new EmbeddedCompanyUiCatalog();var core=catalog.Sources.Single(x=>x.Id=="web:core");Assert.Equal(new[]{"Countries:View"},core.Entries.Single(x=>x.Key=="menu.countries").SystemPermissions);Assert.Null(core.Entries.Single(x=>x.Key=="menu.users").SystemPermissions);
  Assert.All(catalog.Sources.Single(x=>x.Id=="web:module-hr").Entries,x=>Assert.Null(x.SystemPermissions));
 }
 private static PlatformDbContext Db(Actor actor)=>new(new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options,actor);
 private static HttpContextAccessor Http(params string[] grants)=>new(){HttpContext=new DefaultHttpContext{User=new ClaimsPrincipal(new ClaimsIdentity(grants.Select(x=>new Claim(PermissionClaimNames.Permission,x)),"test"))}};
 private sealed class Actor:ICurrentActor {public bool Global=true;public bool IsInRole(string role)=>Global&&role==PlatformRoleNames.SuperAdmin;public string? UserId=>"global";public string? TenantId=>null;public int? CompanyId=>null;public string? CorrelationId=>null;public bool IsAuthenticated=>true;public IReadOnlyCollection<string> Roles=>Global?[PlatformRoleNames.SuperAdmin]:[];}
 private sealed class Catalog:ICompanyUiCatalog {public IReadOnlyList<CompanyUiSource> Sources {get;}=[new("web:test","web","test",[new("public","Public","عام","shared",[]),new("private","Private","خاص","system",["Target:View"])])];public string GetVersion(string client)=>client+"-v";}
 private sealed class Localizer:IStringLocalizer<SystemLocalizationErrors>{public LocalizedString this[string name]=>new(name,name);public LocalizedString this[string name,params object[] args]=>new(name,name);public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)=>[];}
}
