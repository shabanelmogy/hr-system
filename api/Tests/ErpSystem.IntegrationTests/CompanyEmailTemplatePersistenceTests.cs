using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;

namespace ErpSystem.IntegrationTests;

public sealed class CompanyEmailTemplatePersistenceTests
{
    [SqlServerFact]
    public async Task Sql_first_writer_race_and_reset_preserve_monotonic_revision_and_atomic_audit()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpEmailTemplates");
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)).Options;
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            { ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true" }).Build());
        services.AddScoped(_ => new PlatformDbContext(options));
        await using var provider = services.BuildServiceProvider();
        await new PlatformModule().MigrateAsync(provider);
        var actor = new Actor();
        await using var first = new PlatformDbContext(options, actor);
        first.Tenants.Add(new PlatformTenant("email-tenant", "email-tenant", "Email test", DateTime.UtcNow));
        first.Users.Add(new PlatformApplicationUser { Id = "email-user", UserName = "email-user", FirstName = "Alex", LastName = "Test", SecurityStamp = "test" });
        var company = new PlatformCompany("email-tenant", "ONE", "One", "واحد", "EGP", "Africa/Cairo", DateTime.UtcNow);
        first.Companies.Add(company);
        await first.SaveChangesAsync(); actor.CompanyId = company.Id;
        first.UserTenantAccesses.Add(new() { TenantId = "email-tenant", UserId = "email-user" });
        first.UserCompanyAccesses.Add(new() { TenantId = "email-tenant", CompanyId = company.Id, UserId = "email-user" });
        await first.SaveChangesAsync();
        await using var second = new PlatformDbContext(options, actor);
        CompanyEmailTemplateStore Store(PlatformDbContext context) => new(context, actor, new RoleLockResourceFactory(), TimeProvider.System, new(new Localizer()));
        var a = Store(first); var b = Store(second);
        var body = AccountEmailCatalog.Definitions[0].Body("en");
        var results = await Task.WhenAll(a.ChangeAsync("email-confirmation", "en", "First", body, 0, false, default),
            b.ChangeAsync("email-confirmation", "en", "Second", body, 0, false, default));
        Assert.Single(results, result => result.IsSuccess);
        Assert.Single(results, result => result.IsFailure);
        first.ChangeTracker.Clear();
        Assert.Equal(1, (await a.ReadAsync(new(), default))!.Revision);
        Assert.Equal(1, await first.SecurityAuditEvents.CountAsync());
        Assert.True((await a.ChangeAsync("email-confirmation", "en", null, null, 1, true, default)).IsSuccess);
        Assert.Equal(2, (await a.ReadAsync(new(), default))!.Revision);
        Assert.Equal(2, await first.SecurityAuditEvents.CountAsync());
        Assert.True((await a.ChangeAsync("email-confirmation", "en", null, null, 2, true, default)).IsSuccess);
        Assert.Equal(2, await first.SecurityAuditEvents.CountAsync());
        Assert.False((await a.ChangeAsync("email-confirmation", "en", "Stale after reset", body, 0, false, default)).IsSuccess);
    }
    private sealed class Actor : ICurrentActor
    {
        public string? UserId => "email-user";
        public string? TenantId => "email-tenant";
        public int? CompanyId { get; set; }
    }
    private sealed class Localizer : IStringLocalizer<CompanyEmailTemplateErrors>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
