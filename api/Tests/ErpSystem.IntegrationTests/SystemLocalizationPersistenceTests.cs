using System.Security.Claims;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Application.Features.SystemLocalization;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.SystemLocalization;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
namespace ErpSystem.IntegrationTests;
public sealed class SystemLocalizationPersistenceTests
{
 [SqlServerFact] public async Task Sql_first_writer_race_commits_one_revision_and_one_audit_and_reset_is_atomic() {
  await using var database=await SqlServerTestDatabase.CreateAsync("ErpSystemUiTexts");
  var options=new DbContextOptionsBuilder<PlatformDbContext>().UseSqlServer(database.ConnectionString,sql=>sql.MigrationsHistoryTable("__EFMigrationsHistory",PlatformDbContext.Schema)).Options;
  var services=new ServiceCollection();services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?>{{"DatabaseSettings:ApplyMigrationsOnStartup","true"}}).Build());services.AddScoped(_=>new PlatformDbContext(options));
  await using var provider=services.BuildServiceProvider();await new PlatformModule().MigrateAsync(provider);
  var actor=new Actor();await using var first=new PlatformDbContext(options,actor);await using var second=new PlatformDbContext(options,actor);
  var grants=new[]{PlatformPermissions.ViewSystemUiTexts,PlatformPermissions.EditSystemUiTexts,PlatformPermissions.ResetSystemUiTexts};
  var http=new HttpContextAccessor{HttpContext=new DefaultHttpContext{User=new ClaimsPrincipal(new ClaimsIdentity(grants.Select(x=>new Claim(PermissionClaimNames.Permission,x)),"test"))}};
  SystemLocalizationStore Store(PlatformDbContext db)=>new(db,actor,http,new Catalog(),new RoleLockResourceFactory(),TimeProvider.System,new SystemLocalizationErrors(new Localizer()));
  var a=Store(first);var b=Store(second);
  var results=await Task.WhenAll(a.ApplyAsync(new(CompanyLocalizationChangeKind.SetText,"ar",0,"web:test","caption","أول"),default),b.ApplyAsync(new(CompanyLocalizationChangeKind.SetText,"ar",0,"web:test","caption","ثاني"),default));
  Assert.Single(results,x=>x.IsSuccess);Assert.Single(results,x=>x.IsFailure);Assert.Equal(1,(await a.GetSettingsAsync(default))!.Revision);
  Assert.Equal(1,await first.SecurityAuditEvents.IgnoreQueryFilters().CountAsync());first.ChangeTracker.Clear();
  Assert.True((await a.ApplyAsync(new(CompanyLocalizationChangeKind.ResetText,"ar",1,"web:test","caption"),default)).IsSuccess);
  Assert.Empty((await a.GetRuntimeAsync("web",default))!.Overrides);Assert.Equal(2,await first.SecurityAuditEvents.IgnoreQueryFilters().CountAsync());
  Assert.True((await a.ApplyAsync(new(CompanyLocalizationChangeKind.ResetText,"ar",2,"web:test","caption"),default)).IsSuccess);Assert.Equal(2,(await a.GetSettingsAsync(default))!.Revision);
 }
 private sealed class Actor:ICurrentActor{public string? UserId=>"operator";public string? TenantId=>null;public int? CompanyId=>null;public bool IsInRole(string role)=>role==PlatformRoleNames.SuperAdmin;}
 private sealed class Catalog:ICompanyUiCatalog{public IReadOnlyList<CompanyUiSource> Sources {get;}=[new("web:test","web","test",[new("caption","Caption","عنوان","shared",[])])];public string GetVersion(string client)=>"test-v1";}
 private sealed class Localizer:IStringLocalizer<SystemLocalizationErrors>{public LocalizedString this[string name]=>new(name,name);public LocalizedString this[string name,params object[] args]=>new(name,name);public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)=>[];}
}
