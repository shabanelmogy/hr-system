using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyEmailTemplateStoreTests
{
    [Fact]
    public async Task Company_changes_are_isolated_revisioned_and_audited_while_anonymous_render_uses_default()
    {
        var actor = new Actor();
        await using var db = new PlatformDbContext(new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options, actor);
        db.Companies.Add(new PlatformCompany("tenant", "ONE", "One", "واحد", "EGP", "Africa/Cairo", DateTime.UtcNow));
        db.UserTenantAccesses.Add(new PlatformUserTenantAccess { TenantId = "tenant", UserId = "actor" });
        db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess { TenantId = "tenant", CompanyId = 1, UserId = "actor" });
        await db.SaveChangesAsync();
        var store = new CompanyEmailTemplateStore(db, actor, new RoleLockResourceFactory(), TimeProvider.System, new(new Localizer()));
        var body = AccountEmailCatalog.Definitions[0].Body("en");
        Assert.True((await store.ChangeAsync("email-confirmation", "en", "Company A", body, 0, false, default)).IsSuccess);
        Assert.Single(await db.SecurityAuditEvents.ToArrayAsync());
        Assert.True((await store.ChangeAsync("email-confirmation", "en", "Company A", body, 1, false, default)).IsSuccess);
        Assert.Single(await db.SecurityAuditEvents.ToArrayAsync());
        Assert.True((await store.ChangeAsync("email-confirmation", "en", "Stale", body, 0, false, default)).IsFailure);
        Assert.Equal("Company A", (await store.ReadAsync(new("en", Status: "customized"), default))!.Items.Single().Subject);
        Assert.Empty((await store.ReadAsync(new("ar", Status: "customized"), default))!.Items);
        var renderer = new AccountEmailRenderer(db, new AccountEmailScopeResolver(db, actor, store), new AccountEmailContentPolicy());
        Assert.Equal("Company A", (await renderer.RenderAsync("email-confirmation", "en", "Alex", "https://erp.example/action", "tenant", 1, default)).Subject);
        actor.CompanyId = 2;
        Assert.Null(await store.ReadAsync(new(), default));
        Assert.True((await store.ChangeAsync("email-confirmation", "en", "Foreign", body, 1, false, default)).IsFailure);
        actor.CompanyId = null; actor.TenantId = null;
        Assert.Equal(AccountEmailCatalog.Definitions[0].Subject("en"),
            (await renderer.RenderAsync("email-confirmation", "en", "Alex", "https://erp.example/action", null, null, default)).Subject);
        actor.CompanyId = 1; actor.TenantId = "tenant";
        Assert.True((await store.ChangeAsync("email-confirmation", "en", null, null, 1, true, default)).IsSuccess);
        Assert.Equal(2, (await store.ReadAsync(new(), default))!.Revision);
        Assert.True((await store.ChangeAsync("email-confirmation", "en", null, null, 2, true, default)).IsSuccess);
        Assert.Equal(2, await db.SecurityAuditEvents.CountAsync());
        actor.Global = true;
        Assert.Null(await store.ReadAsync(new(), default));
    }
    private sealed class Actor : ICurrentActor
    {
        public string? UserId => "actor";
        public string? TenantId { get; set; } = "tenant";
        public int? CompanyId { get; set; } = 1;
        public bool Global { get; set; }
        public bool IsInRole(string role) => Global && role == "super_admin";
    }
    private sealed class Localizer : IStringLocalizer<CompanyEmailTemplateErrors>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
