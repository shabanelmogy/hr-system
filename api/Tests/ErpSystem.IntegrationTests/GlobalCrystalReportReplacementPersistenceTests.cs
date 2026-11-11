using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
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

public sealed class GlobalCrystalReportReplacementPersistenceTests
{
    [SqlServerFact]
    public async Task Replacement_RollsBackPublicationAndVersionOnCommitFailureThenPublishesAtomically()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpReportReplacement");
        var options = new DbContextOptionsBuilder<ReportingDbContext>().UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "rpt")).Options;
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        Guid reportId;
        Guid firstId;
        string rowVersion;
        await using (var setup = new ReportingDbContext(options, new Actor()))
        {
            await setup.Database.MigrateAsync();
            var report = GlobalCrystalReport.CreateDraft("countries", "countries-directory", "Original", "Keep description",
                "ref.vw_Countries", new string('d', 64));
            var first = GlobalCrystalReportVersion.Create(report.Id, 1, "original.rpt", "Countries.Directory.rpt", 32,
                new string('a', 64), "Original title", "Original subject", contracts.SchemaVersion, contracts.Fingerprint);
            report.AddVersion(first);
            report.RoleGrants.Add(GlobalCrystalReportRoleGrant.Create(report.Id, "reader-role", CrystalReportRight.Run));
            setup.GlobalCrystalReports.Add(report);
            await setup.SaveChangesAsync();
            report.Publish(first, contracts.Fingerprint);
            await setup.SaveChangesAsync();
            reportId = report.Id;
            firstId = first.Id;
            rowVersion = Convert.ToBase64String(report.RowVersion);
        }

        var files = new Files(contracts);
        var upload = new FileUpload("Countries.Directory.rpt", "application/octet-stream", 32,
            () => new MemoryStream(new byte[32]));
        await using (var failed = new ReportingDbContext(options, new Actor()))
        {
            var handler = Handler(failed, files, new FailAfterSave(failed), contracts);
            await Assert.ThrowsAsync<CommitFailure>(() => handler.Handle(
                new ReplaceGlobalCrystalReportCommand(reportId, rowVersion, upload), default));
        }
        Assert.Equal(["replacement-1.rpt"], files.Deleted);
        await using (var verify = new ReportingDbContext(options, new Actor()))
        {
            var detail = await new GlobalCrystalReportStore(verify, ManagedCrystalReportContractRegistry.LoadEmbedded()).DetailAsync(reportId, default);
            Assert.NotNull(detail);
            Assert.Equal(rowVersion, detail.RowVersion);
            Assert.Equal(firstId, Assert.Single(detail.Versions).Id);
            Assert.True(Assert.Single(detail.Versions).IsPublished);
            Assert.Equal("original.rpt", (await verify.GlobalCrystalReportVersions.SingleAsync()).StorageKey);
        }

        await using (var success = new ReportingDbContext(options, new Actor()))
        {
            var result = await Handler(success, files, success, contracts).Handle(
                new ReplaceGlobalCrystalReportCommand(reportId, rowVersion, upload), default);
            Assert.True(result.IsSuccess);
        }
        await using (var verify = new ReportingDbContext(options, new Actor()))
        {
            var detail = await new GlobalCrystalReportStore(verify, ManagedCrystalReportContractRegistry.LoadEmbedded()).DetailAsync(reportId, default);
            Assert.NotNull(detail);
            Assert.Equal(2, detail.Versions.Count);
            Assert.Equal(2, Assert.Single(detail.Versions, version => version.IsPublished).VersionNumber);
            Assert.False(detail.Versions.Single(version => version.Id == firstId).IsPublished);
            Assert.Equal("countries-directory", detail.ReportKey);
            Assert.Equal("Keep description", detail.Description);
            Assert.Equal("ref.vw_Countries", detail.ViewName);
            Assert.Equal("reader-role", (await verify.GlobalCrystalReportRoleGrants.SingleAsync()).RoleId);
            Assert.NotEqual(rowVersion, detail.RowVersion);
        }
        Assert.Equal(["replacement-1.rpt"], files.Deleted);
    }

    private static ReplaceGlobalCrystalReportCommandHandler Handler(ReportingDbContext context, Files files,
        IReportingUnitOfWork unitOfWork, ManagedCrystalReportContractRegistry contracts) =>
        new(new GlobalCrystalReportStore(context, ManagedCrystalReportContractRegistry.LoadEmbedded()), files, unitOfWork,
            new GlobalCrystalReportPolicy(new Actor(), new Permissions()), contracts,
            new CrystalReportErrors(new Echo()), new UnusedAccess());

    private sealed class CommitFailure : Exception;
    private sealed class FailAfterSave(ReportingDbContext context) : IReportingUnitOfWork
    {
        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await context.SaveChangesAsync(cancellationToken);
            throw new CommitFailure();
        }
        public Task<TResult> ExecuteAtomicallyAsync<TResult>(IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation, CancellationToken cancellationToken = default) =>
            context.ExecuteAtomicallyAsync(lockResources, operation, cancellationToken);
    }

    // Storage fixtures prove SQL orchestration only; no claim of native RPT validity.
    private sealed class Files(ManagedCrystalReportContractRegistry contracts) : ICrystalReportFileStorage
    {
        private int _sequence;
        public List<string> Deleted { get; } = [];
        public Task<StoreCrystalReportFileResult> StoreAsync(string entityKey, FileUpload upload, CancellationToken token) =>
            Task.FromResult(new StoreCrystalReportFileResult(new StoredCrystalReportFile(
                $"replacement-{++_sequence}.rpt", upload.FileName, upload.Length, new string('b', 64),
                "New title", "New subject", contracts.SchemaVersion, contracts.Fingerprint), CrystalReportFileFailure.None, null));
        public Task DeleteIfExistsAsync(string storageKey, CancellationToken token)
        {
            Deleted.Add(storageKey);
            return Task.CompletedTask;
        }
        public Task<Stream?> OpenVerifiedReadAsync(string storageKey, long expectedSize, string expectedSha256,
            CancellationToken token) => throw new NotSupportedException();
    }

    // Access administration bypasses per-report grants; unexpected access calls fail this test.
    private sealed class UnusedAccess : IGlobalCrystalReportAccessStore
    {
        public Task<PlatformRoleScopePage> RolesAsync(string? search, int page, int pageSize, CancellationToken token) => throw new NotSupportedException();
        public Task<bool> RolesValidAsync(IReadOnlyCollection<string> roleIds, CancellationToken token) => throw new NotSupportedException();
        public Task<IReadOnlyList<GlobalCrystalReportRoleGrantResponse>> GrantsAsync(Guid reportId, CancellationToken token) => throw new NotSupportedException();
        public Task<bool> HasRightAsync(Guid reportId, CrystalReportRight right, CancellationToken token) => throw new NotSupportedException();
        public Task<IReadOnlyList<Guid>> GrantedReportIdsAsync(CrystalReportRight right, CancellationToken token) => throw new NotSupportedException();
        public Task ReplaceAsync(Guid reportId, IReadOnlyList<GlobalCrystalReportRoleGrant> grants, CancellationToken token) => throw new NotSupportedException();
    }
    private sealed class Actor : ICurrentActor
    {
        public string UserId => "replacement-sql-test";
        public string? TenantId => null;
        public int? CompanyId => null;
        public bool IsInRole(string role) => role == "super_admin";
    }
    private sealed class Permissions : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => ReportingPermissions.GlobalReports.Contains(permission) || permission == "Countries:Edit";
    }
    private sealed class Echo : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
