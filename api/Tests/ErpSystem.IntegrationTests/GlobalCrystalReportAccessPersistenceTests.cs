using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace ErpSystem.IntegrationTests;

public sealed class GlobalCrystalReportAccessPersistenceTests
{
    [SqlServerFact]
    public async Task GlobalAccess_EnforcesTenantRoleRightsRevocationArchiveAndRootConcurrency()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpGlobalAccess");
        var options = new DbContextOptionsBuilder<ReportingDbContext>().UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "rpt")).Options;
        var fingerprint = ManagedCrystalReportContractRegistry.LoadEmbedded().Fingerprint;
        var roles = new Roles();
        var permissions = new Permissions();
        var admin = new Actor(null);
        Guid reportId;
        byte[] firstToken;
        await using (var setup = new ReportingDbContext(options, admin))
        {
            await setup.Database.MigrateAsync();
            Assert.Contains("20261102075822_AddGlobalCrystalReportAccess", await setup.Database.GetAppliedMigrationsAsync());
            var report = Report("countries-allowed", fingerprint);
            var foreign = Report("countries-foreign", fingerprint);
            var draft = GlobalCrystalReport.Create("countries", "countries-draft", null);
            setup.GlobalCrystalReports.AddRange(report, foreign, draft);
            setup.GlobalCrystalReportRoleGrants.AddRange(
                GlobalCrystalReportRoleGrant.Create(report.Id, "role-a", CrystalReportRight.Run),
                GlobalCrystalReportRoleGrant.Create(foreign.Id, "role-b", CrystalReportRight.Run | CrystalReportRight.Download),
                GlobalCrystalReportRoleGrant.Create(draft.Id, "role-a", CrystalReportRight.Run));
            await setup.SaveChangesAsync();
            report.Publish(report.Versions.Single(), fingerprint);
            foreign.Publish(foreign.Versions.Single(), fingerprint);
            await setup.SaveChangesAsync();
            reportId = report.Id;
            firstToken = report.RowVersion.ToArray();
        }
        await using (var tenant = new ReportingDbContext(options, new Actor("tenant-a")))
        {
            var access = new GlobalCrystalReportAccessStore(tenant, new Actor("tenant-a"), roles);
            var consumer = new GlobalCrystalReportConsumptionStore(tenant,
                new GlobalCrystalReportConsumerPolicy(new Actor("tenant-a"), permissions), access);
            Assert.Empty(await tenant.GlobalCrystalReports.ToArrayAsync());
            Assert.Empty(await tenant.GlobalCrystalReportRoleGrants.ToArrayAsync());
            Assert.Single(await consumer.CatalogAsync("countries", CrystalReportRight.Run, default));
            Assert.Empty(await consumer.CatalogAsync("countries", CrystalReportRight.Download, default));
            Assert.Empty(await consumer.CatalogAsync("states", CrystalReportRight.Run, default));
            roles.Deleted = true;
            Assert.Empty(await consumer.CatalogAsync("countries", CrystalReportRight.Run, default));
            roles.Deleted = false;
            tenant.GlobalCrystalReportRoleGrants.Add(GlobalCrystalReportRoleGrant.Create(reportId, "role-b", CrystalReportRight.Run));
            await Assert.ThrowsAsync<InvalidOperationException>(() => tenant.SaveChangesAsync());
        }
        await using (var edit = new ReportingDbContext(options, admin))
        {
            var store = new GlobalCrystalReportStore(edit, ManagedCrystalReportContractRegistry.LoadEmbedded());
            var access = new GlobalCrystalReportAccessStore(edit, admin, roles);
            var handler = new ReplaceGlobalCrystalReportGrantsCommandHandler(store, access,
                new GlobalCrystalReportPolicy(admin, permissions), edit, new CrystalReportErrors(new Echo()));
            var result = await handler.Handle(new ReplaceGlobalCrystalReportGrantsCommand(reportId,
                Convert.ToBase64String(firstToken), [new("role-a", ["Run", "Download"])]), default);
            Assert.True(result.IsSuccess);
            var report = await edit.GlobalCrystalReports.SingleAsync(report => report.Id == reportId);
            Assert.False(firstToken.SequenceEqual(report.RowVersion));
            Assert.Equal(2, await edit.GlobalCrystalReportRoleGrants.CountAsync(grant => grant.GlobalCrystalReportId == reportId));
            Assert.Single(await edit.GlobalCrystalReportRoleGrants.Where(grant => grant.GlobalCrystalReportId == reportId && !grant.IsDeleted).ToArrayAsync());
            var stale = await handler.Handle(new ReplaceGlobalCrystalReportGrantsCommand(reportId,
                Convert.ToBase64String(firstToken), []), default);
            Assert.Equal("CrystalReport.ConcurrencyConflict", stale.Error.Code);
            var invalid = await handler.Handle(new ReplaceGlobalCrystalReportGrantsCommand(reportId,
                Convert.ToBase64String(report.RowVersion), [new("missing-role", ["Run"])]), default);
            Assert.Equal("CrystalReport.InvalidRole", invalid.Error.Code);
        }
        await using (var tenant = new ReportingDbContext(options, new Actor("tenant-a")))
        {
            var access = new GlobalCrystalReportAccessStore(tenant, new Actor("tenant-a"), roles);
            var consumer = new GlobalCrystalReportConsumptionStore(tenant,
                new GlobalCrystalReportConsumerPolicy(new Actor("tenant-a"), permissions), access);
            Assert.Single(await consumer.CatalogAsync("countries", CrystalReportRight.Download, default));
        }
        await using (var archive = new ReportingDbContext(options, admin))
        {
            var report = await archive.GlobalCrystalReports.SingleAsync(report => report.Id == reportId);
            var handler = new ArchiveGlobalCrystalReportCommandHandler(new GlobalCrystalReportStore(archive, ManagedCrystalReportContractRegistry.LoadEmbedded()),
                new GlobalCrystalReportPolicy(admin, permissions), archive, new CrystalReportErrors(new Echo()));
            Assert.True((await handler.Handle(new ArchiveGlobalCrystalReportCommand(reportId, Convert.ToBase64String(report.RowVersion)), default)).IsSuccess);
            Assert.NotNull(report.DeletedOn);
            Assert.Equal(admin.UserId, report.DeletedById);
            Assert.NotEmpty(await archive.GlobalCrystalReportVersions.Where(version => version.GlobalCrystalReportId == reportId).ToArrayAsync());
        }
        await using (var tenant = new ReportingDbContext(options, new Actor("tenant-a")))
        {
            var access = new GlobalCrystalReportAccessStore(tenant, new Actor("tenant-a"), roles);
            var consumer = new GlobalCrystalReportConsumptionStore(tenant,
                new GlobalCrystalReportConsumerPolicy(new Actor("tenant-a"), permissions), access);
            Assert.Empty(await consumer.CatalogAsync("countries", CrystalReportRight.Run, default));
            Assert.Empty(await consumer.CatalogAsync("countries", CrystalReportRight.Download, default));
        }
    }

    private static GlobalCrystalReport Report(string key, string fingerprint)
    {
        var report = GlobalCrystalReport.Create("countries", key, null);
        var version = GlobalCrystalReportVersion.Create(report.Id, 1, $"{Guid.NewGuid():N}.rpt", "Countries.rpt", 32,
            new string('a', 64), "SQL grant fixture", null, 1, fingerprint);
        report.AddVersion(version);
        return report;
    }
    private sealed class Actor(string? tenant) : ICurrentActor
    {
        public string? UserId => "grant-fixture";
        public string? TenantId => tenant;
        public int? CompanyId => tenant == null ? null : 1;
        public bool IsInRole(string role) => tenant == null && role == "super_admin";
    }
    private sealed class Permissions : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => ReportingPermissions.GlobalReports.Contains(permission) ||
            permission is "Countries:Edit" or "Countries:View" or "CrystalReports:View" or "CrystalReports:Download";
    }
    private sealed class Roles : IPlatformAuthorizationSource
    {
        public bool Deleted { get; set; }
        private static readonly PlatformRoleScopeOption[] Values = [new("role-a", "Employee", "tenant-a", "Tenant A"), new("role-b", "Employee", "tenant-b", "Tenant B")];
        public Task<int> GetUserCountAsync(CancellationToken cancellationToken = default) => Task.FromResult(1);
        public Task<IReadOnlyCollection<string>> GetUserRoleIdsAsync(string userId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<string>>(["role-a", "role-b"]);
        public Task<IReadOnlyCollection<PlatformRoleOption>> GetAssignableRolesAsync(string? tenantId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<PlatformRoleOption>>(Deleted ? [] : Values.Where(role => role.TenantId == tenantId).Select(role => new PlatformRoleOption(role.Id, role.Name)).ToArray());
        public Task<IReadOnlyCollection<PlatformRoleOption>> GetRolesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<PlatformRoleOption>>(Values.Where(role => roleIds.Contains(role.Id)).Select(role => new PlatformRoleOption(role.Id, role.Name)).ToArray());
        public Task<bool> AreRoleIdsValidAsync(string? tenantId, IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default) => Task.FromResult(roleIds.All(id => Values.Any(role => role.Id == id && role.TenantId == tenantId)));
        public Task<PlatformRoleScopePage> GetRoleScopesPageAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default) => Task.FromResult(new PlatformRoleScopePage(Values, Values.Length));
        public Task<IReadOnlyList<PlatformRoleScopeOption>> GetRoleScopesAsync(IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<PlatformRoleScopeOption>>(Values.Where(role => roleIds.Contains(role.Id)).ToArray());
    }
    private sealed class Echo : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
