using ClosedXML.Excel;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class ErrorLogStoreTests
{
    private static readonly DateTime Now = new(2026, 10, 17, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task Company_projection_cannot_read_foreign_or_system_records_and_hides_diagnostics_and_ip()
    {
        await using var db = CreateDb();
        var own = Entry("tenant", 1); var otherCompany = Entry("tenant", 2); var foreign = Entry("foreign", 1); var system = Entry(null, null);
        db.ErrorLogEntries.AddRange(own, otherCompany, foreign, system); await db.SaveChangesAsync();
        var store = Store(db);

        var company = await store.ListAsync(new(), false, "tenant", 1, default);
        Assert.Equal(1, company.TotalCount); Assert.Equal(own.Id, Assert.Single(company.Items).Id);
        Assert.Null(company.Items[0].IpAddress);
        Assert.Null(await store.DetailAsync(otherCompany.Id, false, "tenant", 1, default));
        Assert.Null(await store.DetailAsync(foreign.Id, false, "tenant", 1, default));
        Assert.Null(await store.DetailAsync(system.Id, false, "tenant", 1, default));
        Assert.Empty((await store.DetailAsync(own.Id, false, "tenant", 1, default))!.Diagnostics);

        var global = await store.ListAsync(new(), true, null, null, default);
        Assert.Equal(4, global.TotalCount); Assert.All(global.Items, row => Assert.Equal("127.0.0.1", row.IpAddress));
        var diagnostic = await store.DetailAsync(own.Id, true, null, null, default);
        Assert.Equal("Erp.SafeMethod", Assert.Single(diagnostic!.Diagnostics));
    }

    [Fact]
    public async Task Filtering_and_paging_use_server_criteria_and_stable_disjoint_pages()
    {
        await using var db = CreateDb();
        db.Users.Add(new PlatformApplicationUser { Id = "actor", UserName = "operator" });
        db.ErrorLogEntries.AddRange(Entry("tenant", 1), Entry("tenant", 1), Entry("tenant", 2));
        await db.SaveChangesAsync(); var store = Store(db);
        var criteria = new ErrorLogCriteria(Now.AddDays(-1), Now.AddDays(1), "oper", "api", 500, "HttpServerError", 1, 1);
        var first = await store.ListAsync(criteria, false, "tenant", 1, default);
        var second = await store.ListAsync(criteria with { Page = 2 }, false, "tenant", 1, default);
        Assert.Equal(2, first.TotalCount); Assert.Single(first.Items); Assert.Single(second.Items);
        Assert.NotEqual(first.Items[0].Id, second.Items[0].Id);
        Assert.Empty((await store.ListAsync(criteria with { StatusCode = 400 }, false, "tenant", 1, default)).Items);
    }

    [Fact]
    public async Task Scope_requires_fresh_active_actor_membership_company_and_tenant()
    {
        await using var db = CreateDb();
        db.Tenants.Add(new PlatformTenant("tenant", "tenant", "Tenant", Now));
        var company = new PlatformCompany("tenant", "ONE", "One", "واحد", "EGP", "Africa/Cairo", Now);
        db.Companies.Add(company); db.Users.Add(new PlatformApplicationUser { Id = "actor", UserName = "operator" });
        await db.SaveChangesAsync();
        db.UserTenantAccesses.Add(new PlatformUserTenantAccess { TenantId = "tenant", UserId = "actor" });
        db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess { TenantId = "tenant", CompanyId = company.Id, UserId = "actor" });
        await db.SaveChangesAsync(); var store = Store(db);

        Assert.True(await store.HasCompanyScopeAsync("actor", "tenant", company.Id, default));
        Assert.False(await store.HasCompanyScopeAsync("actor", "foreign", company.Id, default));
        Assert.False(await store.HasCompanyScopeAsync("actor", "tenant", company.Id + 1, default));
        Assert.False(await store.HasCompanyScopeAsync(null, "tenant", company.Id, default));
        db.UserCompanyAccesses.RemoveRange(db.UserCompanyAccesses.IgnoreQueryFilters()); await db.SaveChangesAsync();
        Assert.False(await store.HasCompanyScopeAsync("actor", "tenant", company.Id, default));
    }

    [Fact]
    public async Task Retention_update_is_revision_checked_noop_safe_and_audited_once()
    {
        await using var db = CreateDb();
        db.ErrorLogRetentionSettings.Add(ErrorLogRetentionSettings.CreateDefault()); await db.SaveChangesAsync();
        var store = Store(db);
        var initial = await store.GetSettingsAsync(default);
        Assert.Equal(90, initial.RetentionDays); Assert.Equal(0, initial.Revision);
        Assert.NotNull(await store.UpdateSettingsAsync(90, 0, "actor", default));
        Assert.Empty(await db.SecurityAuditEvents.IgnoreQueryFilters().ToListAsync());
        var changed = await store.UpdateSettingsAsync(91, 0, "actor", default);
        Assert.Equal(91, changed!.RetentionDays); Assert.Equal(1, changed.Revision);
        Assert.Null(await store.UpdateSettingsAsync(92, 0, "actor", default));
        Assert.Equal(91, (await store.GetSettingsAsync(default)).RetentionDays);
        var audit = Assert.Single(await db.SecurityAuditEvents.IgnoreQueryFilters().ToListAsync());
        Assert.Equal("actor", audit.ActorUserId); Assert.Equal("ErrorLogSettings.Edit", audit.Action);
    }

    [Fact]
    public async Task Export_is_a_real_projection_safe_workbook_with_text_cells_and_no_diagnostics()
    {
        await using var db = CreateDb();
        db.Users.Add(new PlatformApplicationUser { Id = "actor", UserName = "=HYPERLINK(\"example\")" });
        db.ErrorLogEntries.AddRange(Entry("tenant", 1), Entry("foreign", 2)); await db.SaveChangesAsync();
        var store = Store(db);
        var company = await store.ExportAsync(new(), false, "tenant", 1, default);
        using var workbook = new XLWorkbook(new MemoryStream(company!.Contents));
        var sheet = workbook.Worksheet(1);
        Assert.Equal(2, sheet.LastRowUsed()!.RowNumber());
        Assert.False(sheet.Cell(2, 4).HasFormula);
        Assert.Contains("HYPERLINK", sheet.Cell(2, 4).GetString(), StringComparison.Ordinal);
        Assert.True(sheet.Cell(2, 13).IsEmpty());
        Assert.DoesNotContain(sheet.CellsUsed(), cell => cell.GetString().Contains("Erp.SafeMethod", StringComparison.Ordinal));
        var global = await store.ExportAsync(new(), true, null, null, default);
        using var globalBook = new XLWorkbook(new MemoryStream(global!.Contents));
        Assert.Equal("127.0.0.1", globalBook.Worksheet(1).Cell(2, 13).GetString());
    }

    [Fact]
    public async Task Export_rejects_more_than_5000_rows_without_returning_a_partial_workbook()
    {
        await using var db = CreateDb();
        db.ErrorLogEntries.AddRange(Enumerable.Range(0, 5001).Select(_ => Entry("tenant", 1)));
        await db.SaveChangesAsync();
        Assert.Null(await Store(db).ExportAsync(new(), false, "tenant", 1, default));
    }

    private static PlatformDbContext CreateDb() => new(new DbContextOptionsBuilder<PlatformDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private static ErrorLogStore Store(PlatformDbContext db) => new(db, new ErrorLogCaptureQueue(), TimeProvider.System);
    private static ErrorLogEntry Entry(string? tenantId, int? companyId) => ErrorLogEntry.Create(Guid.NewGuid(), Now,
        "api", "error", tenantId, companyId, "actor", "OrdersController", "Get", 500, 10, "correlation",
        "HttpServerError", "http", "Chrome", "127.0.0.1", "[\"Erp.SafeMethod\"]");
}
