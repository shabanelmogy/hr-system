using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.IntegrationTests;

public sealed class GlobalCrystalReportPersistenceTests
{
    [SqlServerFact]
    public async Task GlobalVersions_MigratePublishAndRejectStalePublicationWithoutCrossTenantAccess()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpGlobalCrystal");
        var options = new DbContextOptionsBuilder<ReportingDbContext>().UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "rpt")).Options;
        var fingerprint = ManagedCrystalReportContractRegistry.LoadEmbedded().Fingerprint;
        Guid reportId;
        Guid firstId;
        Guid secondId;
        await using (var setup = new ReportingDbContext(options, new Actor(true)))
        {
            await setup.Database.MigrateAsync();
            Assert.Contains("20261101123802_AddGlobalCrystalReportVersions", await setup.Database.GetAppliedMigrationsAsync());
            var report = GlobalCrystalReport.Create("countries", "countries-sql-proof", null);
            var first = Version(report.Id, 1, fingerprint);
            report.AddVersion(first);
            setup.GlobalCrystalReports.Add(report);
            await setup.SaveChangesAsync();
            Assert.Equal(8, report.RowVersion.Length);
            var store = new GlobalCrystalReportStore(setup);
            Assert.Null(Assert.Single(await store.CatalogAsync("countries", default)).PublishedVersion);
            var drafts = await store.ListAsync(["countries"], null, 1, 10, default, "draft");
            Assert.False(Assert.Single(drafts.Items).IsPublished);
            reportId = report.Id;
            firstId = first.Id;
            report.Publish(first, fingerprint);
            await setup.SaveChangesAsync();
            var second = Version(report.Id, 2, fingerprint);
            report.AddVersion(second);
            setup.GlobalCrystalReportVersions.Add(second);
            await setup.SaveChangesAsync();
            secondId = second.Id;
            Assert.Equal(first.Id, report.CurrentPublishedVersionId);
            Assert.Equal(first.Id, Assert.Single(await store.CatalogAsync("countries", default)).PublishedVersion!.Id);
            Assert.Equal(2, (await store.DetailAsync(report.Id, default))!.Versions.Count);
        }
        await using (var winner = new ReportingDbContext(options, new Actor(true)))
        await using (var loser = new ReportingDbContext(options, new Actor(true)))
        {
            var current = await winner.GlobalCrystalReports.SingleAsync(x => x.Id == reportId);
            var stale = await loser.GlobalCrystalReports.SingleAsync(x => x.Id == reportId);
            var second = await winner.GlobalCrystalReportVersions.SingleAsync(x => x.Id == secondId);
            current.Publish(second, fingerprint);
            await winner.SaveChangesAsync();
            var first = await loser.GlobalCrystalReportVersions.SingleAsync(x => x.Id == firstId);
            // The real publish handler checks/advances the root even when the chosen
            // pointer matches this stale context's previously published version.
            new GlobalCrystalReportStore(loser).ApplyRowVersion(stale, stale.RowVersion);
            stale.Publish(first, fingerprint);
            await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => loser.SaveChangesAsync());
        }
        await using (var tenant = new ReportingDbContext(options, new Actor(false)))
        {
            Assert.Empty(await tenant.GlobalCrystalReports.ToArrayAsync());
            Assert.Empty(await tenant.GlobalCrystalReportVersions.ToArrayAsync());
            tenant.GlobalCrystalReports.Add(GlobalCrystalReport.Create("countries", "countries-denied", null));
            await Assert.ThrowsAsync<InvalidOperationException>(() => tenant.SaveChangesAsync());
        }
        await using (var verify = new ReportingDbContext(options, new Actor(true)))
        {
            var report = await verify.GlobalCrystalReports.SingleAsync(x => x.Id == reportId);
            Assert.Equal(secondId, report.CurrentPublishedVersionId);
            Assert.Equal(2, await verify.GlobalCrystalReportVersions.CountAsync());
            var version = await verify.GlobalCrystalReportVersions.SingleAsync(x => x.Id == firstId);
            verify.Entry(version).Property(x => x.StorageKey).CurrentValue = "tampered.rpt";
            await Assert.ThrowsAsync<InvalidOperationException>(() => verify.SaveChangesAsync());
        }
        await using (var archive = new ReportingDbContext(options, new Actor(true)))
        {
            var report = await archive.GlobalCrystalReports.SingleAsync(x => x.Id == reportId);
            report.Archive();
            await archive.SaveChangesAsync();
            var store = new GlobalCrystalReportStore(archive);
            Assert.Null(Assert.Single(await store.CatalogAsync("countries", default)).PublishedVersion);
            Assert.Empty((await store.ListAsync(["countries"], null, 1, 10, default)).Items);
            var archived = await store.ListAsync(["countries"], null, 1, 10, default, "archived");
            Assert.True(Assert.Single(archived.Items).IsArchived);
        }

    }

    private static GlobalCrystalReportVersion Version(Guid reportId, int number, string fingerprint) =>
        GlobalCrystalReportVersion.Create(reportId, number, $"{Guid.NewGuid():N}.rpt", "Countries.rpt", 32,
            new string('a', 64), "SQL fixture", null, 1, fingerprint);

    private sealed class Actor(bool global) : ICurrentActor
    {
        public string UserId => "global-report-test";
        public string? TenantId => global ? null : "tenant-test";
        public int? CompanyId => global ? null : 1;
        public bool IsInRole(string role) => global && role == "super_admin";
    }
}
