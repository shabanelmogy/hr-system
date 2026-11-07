using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportDatabaseVerificationTests
{
    [Fact]
    public async Task Verify_PublishesANewVersionAndPreservesTheOriginal()
    {
        var fixture = new Fixture();
        var original = fixture.Report.CurrentPublishedVersionId;
        var result = await fixture.Run();
        Assert.True(result.IsSuccess);
        Assert.Equal(2, fixture.Report.Versions.Count);
        Assert.NotEqual(original, fixture.Report.CurrentPublishedVersionId);
        Assert.Contains(fixture.Report.Versions, version => version.Id == original);
        Assert.Equal(1, fixture.UnitOfWork.Saves);
        Assert.Equal(0, fixture.Files.Deletes);
        Assert.Equal(1, fixture.Files.Reads);
    }

    [Fact]
    public async Task Verify_RuntimeFailurePreservesPublicationWithoutStoringAFile()
    {
        var fixture = new Fixture();
        fixture.Verifier.Unavailable = true;
        var original = fixture.Report.CurrentPublishedVersionId;
        var result = await fixture.Run();
        Assert.True(result.IsFailure);
        Assert.Equal(original, fixture.Report.CurrentPublishedVersionId);
        Assert.Single(fixture.Report.Versions);
        Assert.Equal(0, fixture.Files.Writes);
        Assert.Equal(0, fixture.UnitOfWork.Saves);
    }

    [Theory]
    [InlineData(CrystalReportFileFailure.SchemaMismatch, "CrystalReport.SchemaMismatch")]
    [InlineData(CrystalReportFileFailure.InspectionUnavailable, "CrystalReport.InspectorUnavailable")]
    public async Task Verify_PreservesSpecificStorageFailures(CrystalReportFileFailure failure, string code)
    {
        var fixture = new Fixture();
        fixture.Files.Failure = failure;
        var original = fixture.Report.CurrentPublishedVersionId;
        var result = await fixture.Run();
        Assert.True(result.IsFailure);
        Assert.Equal(code, result.Error.Code);
        Assert.Equal(original, fixture.Report.CurrentPublishedVersionId);
        Assert.Equal(0, fixture.UnitOfWork.Saves);
    }

    [Fact]
    public async Task Verify_RechecksArchiveBeforeCommitAndCompensatesTheNewFile()
    {
        var fixture = new Fixture();
        fixture.Files.BeforeStore = fixture.Report.Archive;
        var original = fixture.Report.CurrentPublishedVersionId;
        var result = await fixture.Run();
        Assert.True(result.IsFailure);
        Assert.Equal(original, fixture.Report.CurrentPublishedVersionId);
        Assert.Single(fixture.Report.Versions);
        Assert.Equal(1, fixture.Files.Deletes);
        Assert.Equal(0, fixture.UnitOfWork.Saves);
    }

    [Fact]
    public async Task Verify_RequiresBothUploadAndPublishBeforeOpeningStoredSource()
    {
        var fixture = new Fixture();
        fixture.Permissions.DenyPublish = true;
        var result = await fixture.Run();
        Assert.True(result.IsFailure);
        Assert.Equal(0, fixture.Files.Reads);
        Assert.Equal(0, fixture.Files.Writes);
        Assert.Equal(0, fixture.Verifier.Calls);
    }

    private sealed class Fixture
    {
        public readonly GlobalCrystalReport Report = GlobalCrystalReport.Create("countries", "countries-fixture", null);
        public readonly GlobalCrystalReportTestFiles Files = new();
        public readonly Verifier Verifier = new();
        public readonly UnitOfWork UnitOfWork = new();
        public readonly Permissions Permissions = new();
        private readonly ManagedCrystalReportContractRegistry contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        public Fixture()
        {
            var version = GlobalCrystalReportVersion.Create(Report.Id, 1, "original.rpt", "countries-fixture.rpt",
                14, new string('a', 64), "Original", null, contracts.SchemaVersion, contracts.Fingerprint);
            Report.AddVersion(version);
            Report.Publish(version, contracts.Fingerprint);
        }
        public Task<ErpSystem.BuildingBlocks.Application.Common.Errors.Result<CrystalReportDetailResponse>> Run() =>
            Handler().Handle(new VerifyDatabaseGlobalCrystalReportVersionCommand(Report.Id, Report.Versions.First().Id), default);

        private VerifyDatabaseGlobalCrystalReportVersionCommandHandler Handler() => new(new Store(Report), Files,
            Verifier, UnitOfWork, new GlobalCrystalReportPolicy(new Actor(), Permissions), contracts,
            new CrystalReportErrors(new Localizer()), new GlobalCrystalReportTestAccess { Granted = true });
    }

    private sealed class Actor : ICurrentActor
    {
        public string? UserId => "verification-fixture";
        public string? TenantId => null;
        public int? CompanyId => null;
        public bool IsInRole(string role) => role == "super_admin";
    }
    private sealed class Permissions : ICurrentPermissionChecker
    {
        public bool DenyPublish { get; set; }
        public bool HasPermission(string permission) => !DenyPublish || permission != "GlobalCrystalReports:Publish";
    }
    private sealed class Verifier : ICrystalReportDatabaseVerifier
    {
        public bool Unavailable { get; set; }
        public int Calls { get; private set; }
        public Task<FileUpload?> VerifyDatabaseAsync(string entityKey, FileUpload upload, CancellationToken cancellationToken)
        {
            Calls++;
            return Task.FromResult(Unavailable ? null : new FileUpload("countries-verified.rpt", "application/octet-stream",
                8, () => new MemoryStream("verified"u8.ToArray())));
        }
    }
    private sealed class UnitOfWork : IReportingUnitOfWork
    {
        public int Saves { get; private set; }
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) { Saves++; return Task.FromResult(1); }
        public Task<T> ExecuteAtomicallyAsync<T>(IReadOnlyCollection<string> resources, Func<CancellationToken, Task<T>> operation,
            CancellationToken cancellationToken = default) => operation(cancellationToken);
    }
    private sealed class Store(GlobalCrystalReport report) : IGlobalCrystalReportStore
    {
        public Task<CrystalReportDetailResponse?> DetailAsync(Guid id, CancellationToken token) => Task.FromResult<CrystalReportDetailResponse?>(
            new(report.Id, report.EntityKey, report.ReportKey, report.DisplayName, null, 1, true, report.IsDeleted, "", default, null, [], []));
        public Task<GlobalCrystalReport?> FindAsync(Guid id, CancellationToken token) => Task.FromResult<GlobalCrystalReport?>(report);
        public Task<GlobalCrystalReportVersion?> VersionAsync(Guid id, Guid versionId, CancellationToken token) =>
            Task.FromResult(report.Versions.FirstOrDefault(version => version.Id == versionId));
        public Task<int> NextVersionAsync(Guid id, CancellationToken token) => Task.FromResult(report.Versions.Count + 1);
        public void AddVersion(GlobalCrystalReportVersion version) { }
        public Task<CrystalReportPageResponse> ListAsync(IReadOnlyCollection<string> entities, string? search, int page, int pageSize,
            CancellationToken token, string? status = null, IReadOnlyList<GlobalCrystalReportFilterGroup>? filters = null) => throw new NotSupportedException();
        public Task<GlobalCrystalReport?> FindByKeyAsync(string entity, string key, CancellationToken token) => throw new NotSupportedException();
        public Task<bool> KeyExistsAsync(string entity, string key, CancellationToken token) => throw new NotSupportedException();
        public Task<IReadOnlyList<GlobalCrystalManagedCatalogEntry>> CatalogAsync(string entity, CancellationToken token) => throw new NotSupportedException();
        public void Add(GlobalCrystalReport value) => throw new NotSupportedException();
        public void ApplyRowVersion(GlobalCrystalReport value, byte[] version) => throw new NotSupportedException();
    }
    private sealed class Localizer : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string key] => new(key, key);
        public LocalizedString this[string key, params object[] arguments] => new(key, key);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}

