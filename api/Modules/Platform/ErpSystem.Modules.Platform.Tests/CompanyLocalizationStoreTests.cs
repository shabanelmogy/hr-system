using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.CompanyLocalization;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyLocalizationStoreTests
{
    [Fact]
    public async Task Apply_noop_stale_reset_and_default_are_scoped_and_audited_only_when_changed()
    {
        await using var fixture = await Fixture.Create();
        Assert.True((await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText,"ar",0,"web:common","welcome","مرحبا {{name}}"), default)).IsSuccess);
        Assert.Single(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
        var notification = Assert.Single(fixture.Realtime.Changes);
        Assert.Equal(RealtimeAudience.ForCompany("tenant", 1), notification.Audience);
        Assert.Equal("company-localizations", notification.Resource);
        Assert.True((await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText,"ar",1,"web:common","welcome","مرحبا {{name}}"), default)).IsSuccess);
        Assert.Single(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
        Assert.Single(fixture.Realtime.Changes);
        Assert.True((await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetDefault,"ar",1), default)).IsSuccess);
        Assert.True((await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.ResetText,"ar",2,"web:common","welcome"), default)).IsSuccess);
        Assert.Equal(3, (await fixture.Store.GetSettingsAsync(default))!.Revision);
        Assert.Equal(3, await fixture.Db.SecurityAuditEvents.CountAsync());
        Assert.Equal(3, fixture.Realtime.Changes.Count);
        var stale = await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetDefault,"en",0), default);
        Assert.True(stale.IsFailure); Assert.Equal("CompanyLocalizations.Conflict", stale.Error.Code);
        Assert.Equal("stamp", (await fixture.Db.Users.SingleAsync()).SecurityStamp);
    }
    [Fact]
    public async Task Failed_post_commit_invalidation_does_not_roll_back_settings_or_audit()
    {
        await using var fixture = await Fixture.Create();
        fixture.Realtime.Fail = true;
        var result = await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetDefault, "ar", 0), default);
        Assert.True(result.IsSuccess);
        Assert.Equal("ar", (await fixture.Store.GetSettingsAsync(default))!.DefaultLanguage);
        Assert.Single(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
    }
    [Fact]
    public async Task Texts_are_deterministic_filtered_and_paged_and_runtime_is_client_isolated()
    {
        await using var fixture = await Fixture.Create();
        await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText,"ar",0,"web:common","alpha","ألف"),default);
        var missing = await fixture.Store.GetTextsAsync(new("web:common","en","ar","","missing",1,1),default);
        Assert.Single(missing!.Items); Assert.False(missing.Items[0].IsCustomized);
        var custom = await fixture.Store.GetTextsAsync(new("web:common","en","ar","","customized",1,10),default);
        Assert.Equal("alpha",Assert.Single(custom!.Items).Key);
        var web = await fixture.Store.GetRuntimeAsync("web",default); var mobile = await fixture.Store.GetRuntimeAsync("mobile",default);
        Assert.Single(web!.Overrides); Assert.Empty(mobile!.Overrides);
    }
    [Fact]
    public async Task Foreign_tenant_or_company_scope_is_denied_without_audit()
    {
        await using var fixture = await Fixture.Create();
        fixture.Actor.TenantId = "foreign";
        Assert.Null(await fixture.Store.GetSettingsAsync(default));
        Assert.True((await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetDefault,"ar",0),default)).IsFailure);
        fixture.Actor.TenantId = "tenant"; fixture.Actor.CompanyId = 2;
        Assert.Null(await fixture.Store.GetSettingsAsync(default));
        Assert.True((await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetDefault,"ar",0),default)).IsFailure);
        Assert.Empty(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
    }
    [Fact]
    public async Task Runtime_does_not_emit_dormant_keys_or_placeholder_incompatible_overrides()
    {
        await using var fixture = await Fixture.Create();
        var settings = new CompanyLocalizationSettings("tenant", 1);
        settings.SetText("web:retired", "ar", "removed", "قديم", 0);
        fixture.Db.CompanyLocalizationSettings.Add(settings);
        await fixture.Db.SaveChangesAsync();
        var editor = await fixture.Store.GetTextsAsync(new("web:common", "en", "ar", "", "all", 1, 10), default);
        Assert.NotNull(editor);
        var runtime = await fixture.Store.GetRuntimeAsync("web", default);
        Assert.Empty(runtime!.Overrides);
    }

    [Fact]
    public async Task System_sources_and_mixed_keys_are_not_listed_or_searched()
    {
        await using var fixture = await Fixture.Create();
        var settings = await fixture.Store.GetSettingsAsync(default);
        Assert.DoesNotContain(settings!.Sources, source => source.Id == "web:reference-countries");
        Assert.Null(await fixture.Store.GetTextsAsync(new("web:reference-countries", "en", "ar", "", "all", 1, 10), default));
        var mixed = await fixture.Store.GetTextsAsync(new("web:common", "en", "ar", "", "all", 1, 10), default);
        Assert.Equal(2, mixed!.TotalCount);
        Assert.DoesNotContain(mixed.Items, row => row.Key == "menu.countries");
        var search = await fixture.Store.GetTextsAsync(new("web:common", "en", "ar", "Countries", "all", 1, 10), default);
        Assert.Empty(search!.Items);
    }

    [Theory]
    [InlineData("web:reference-countries", "countries.title")]
    [InlineData("web:common", "menu.countries")]
    [InlineData("mobile:translation", "superAdminDashboard.title")]
    public async Task Previously_saved_system_overrides_are_dormant_and_direct_mutations_are_forbidden(string source, string key)
    {
        await using var fixture = await Fixture.Create();
        var settings = new CompanyLocalizationSettings("tenant", 1);
        settings.SetText(source, "ar", key, "قديم", 0);
        settings.SetText("web:common", "ar", "alpha", "نص الشركة", 1);
        fixture.Db.CompanyLocalizationSettings.Add(settings);
        await fixture.Db.SaveChangesAsync();

        var set = await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.SetText, "ar", 2, source, key, "جديد"), default);
        var reset = await fixture.Store.ApplyAsync(new(CompanyLocalizationChangeKind.ResetText, "ar", 2, source, key), default);
        Assert.True(set.IsFailure); Assert.True(reset.IsFailure);
        Assert.Empty(await fixture.Db.SecurityAuditEvents.ToArrayAsync());
        Assert.Empty(fixture.Realtime.Changes);
        Assert.Equal(2, settings.Revision);
        Assert.Equal(2, settings.Overrides.Count);
        Assert.Equal("alpha", Assert.Single((await fixture.Store.GetRuntimeAsync("web", default))!.Overrides).Key);
        Assert.Empty((await fixture.Store.GetRuntimeAsync("mobile", default))!.Overrides);
    }
    [Fact]
    public void Embedded_catalog_loads_expected_sources_and_versions()
    {
        var catalog = new EmbeddedCompanyUiCatalog();
        Assert.Equal(20,catalog.Sources.Count); Assert.All([catalog.GetVersion("web"),catalog.GetVersion("mobile")], value => Assert.Matches("^[0-9A-Fa-f]{64}$",value));
        Assert.Contains(catalog.Sources,item => item.Id=="mobile:translation"); Assert.Contains(catalog.Sources,item => item.Namespace=="module-hr"); Assert.Contains(catalog.Sources,item => item.Namespace=="module-accounting");
        Assert.All(catalog.Sources.Single(source => source.Namespace == "reference-countries").Entries, text => Assert.Equal("system", text.Scope));
        Assert.Equal("system", catalog.Sources.Single(source => source.Namespace == "core").Entries.Single(text => text.Key == "menu.countries").Scope);
        Assert.Equal("company", catalog.Sources.Single(source => source.Namespace == "reference-address-types").Entries[0].Scope);
        Assert.Equal("company", catalog.Sources.Single(source => source.Client == "mobile").Entries.Single(text => text.Key == "userPermissions.title").Scope);
    }
    private sealed class Fixture(PlatformDbContext db, CompanyLocalizationStore store, Actor actor, Realtime realtime) : IAsyncDisposable
    {
        public Realtime Realtime => realtime;
        public PlatformDbContext Db => db; public CompanyLocalizationStore Store => store; public Actor Actor => actor; public ValueTask DisposeAsync()=>db.DisposeAsync();
        public static async Task<Fixture> Create()
        {
            var actor=new Actor(); var db=new PlatformDbContext(new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options,actor);
            db.Companies.Add(new PlatformCompany("tenant","ONE","One","واحد","EGP","Africa/Cairo",DateTime.UtcNow));
            db.Users.Add(new PlatformApplicationUser { Id="actor",UserName="actor",SecurityStamp="stamp" });
            db.UserTenantAccesses.Add(new PlatformUserTenantAccess { TenantId="tenant",UserId="actor" }); db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess { TenantId="tenant",CompanyId=1,UserId="actor" }); await db.SaveChangesAsync();
            var realtime = new Realtime();
            return new(db,new CompanyLocalizationStore(db,actor,new Catalog(),new RoleLockResourceFactory(),TimeProvider.System,new CompanyLocalizationErrors(new Localizer()),realtime,NullLogger<CompanyLocalizationStore>.Instance),actor,realtime);
        }
    }
    private sealed class Realtime : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Changes { get; } = [];
        public bool Fail { get; set; }
        public void Dispatch(RealtimeChangeRequest request)
        {
            if (Fail) throw new InvalidOperationException("Dispatcher unavailable");
            Changes.Add(request);
        }
    }
    private sealed class Catalog:ICompanyUiCatalog { public IReadOnlyList<CompanyUiSource> Sources {get;}=[
        new("web:common","web","common",[new("alpha","Alpha","ألف","shared"),new("welcome","Welcome {{name}}","مرحبا {{name}}","shared"),new("menu.countries","Countries","الدول","system")]),
        new("web:reference-countries","web","reference-countries",[new("countries.title","Countries","الدول","system")]),
        new("mobile:translation","mobile","translation",[new("hello","Hello","مرحبا","shared"),new("superAdminDashboard.title","System dashboard","إدارة النظام","system")])]; public string GetVersion(string client)=>client+"-v"; }
    private sealed class Actor:ICurrentActor { public string? UserId=>"actor"; public string? TenantId { get; set; }="tenant"; public int? CompanyId { get; set; }=1; public string? CorrelationId=>null; public bool IsAuthenticated=>true; public IReadOnlyCollection<string> Roles=>[]; public IReadOnlyCollection<string> Permissions=>[]; public bool HasPermission(string permission)=>false; }
    private sealed class Localizer:IStringLocalizer<CompanyLocalizationErrors> { public LocalizedString this[string name]=>new(name,name); public LocalizedString this[string name,params object[] arguments]=>new(name,name); public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)=>[]; public IStringLocalizer WithCulture(System.Globalization.CultureInfo culture)=>this; }
}
