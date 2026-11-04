using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Security;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using Microsoft.Extensions.Localization;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportQueryTests
{
    private const string SourceId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    private const string Sha256 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

    [Fact]
    public async Task Catalog_ReturnsOnlyValidPublishedVersionsForTheRequestedEntity()
    {
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var identities = new GlobalCrystalReportIdentity();
        var published = PublishedEntry("countries", "published", contracts);
        var invalid = PublishedEntry("countries", "invalid", contracts);
        invalid.PublishedVersion!.RecordValidation(false, "Rejected", contracts.SchemaVersion, contracts.Fingerprint);
        var stale = PublishedEntry("countries", "stale", contracts);
        stale.PublishedVersion!.RecordValidation(true, null, contracts.SchemaVersion, new string('f', 64));
        var store = new GlobalCrystalReportTestStore
        {
            Catalog = [published, invalid, stale,
                new GlobalCrystalManagedCatalogEntry(Guid.NewGuid(), "countries", "draft", "Draft", null, null, null),
                PublishedEntry("states", "other-entity", contracts)]
        };
        var handler = new GetGlobalCrystalReportsQueryHandler(store, contracts, identities,
            Errors(), GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var result = await handler.Handle(new GetGlobalCrystalReportsQuery("COUNTRIES"), default);
        Assert.True(result.IsSuccess);
        var report = Assert.Single(result.Value);
        var version = published.PublishedVersion!;
        Assert.Equal(identities.SourceId(published.ReportId), report.Id);
        Assert.Equal("countries", report.EntityKey);
        Assert.Equal("published", report.ReportKey);
        Assert.Equal(identities.Token(version.Id, contracts.Fingerprint, version.Sha256), report.RowVersion);
        Assert.True(report.IsPublished);
        Assert.False(report.IsArchived);
        Assert.True(report.CanDownloadSource);
    }

    [Fact]
    public async Task Catalog_WithoutPublishedReportsReturnsAnEmptySuccessfulList()
    {
        var handler = new GetGlobalCrystalReportsQueryHandler(new GlobalCrystalReportTestStore(),
            ManagedCrystalReportContractRegistry.LoadEmbedded(), new GlobalCrystalReportIdentity(), Errors(),
            GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var result = await handler.Handle(new GetGlobalCrystalReportsQuery("countries"), default);
        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Render_RejectsUnmanagedOrUnpublishedSourcesBeforeReadingFilesOrData(bool managedDraft)
    {
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var identities = new GlobalCrystalReportIdentity();
        var reportId = Guid.NewGuid();
        var store = new GlobalCrystalReportTestStore
        {
            Catalog = managedDraft
                ? [new GlobalCrystalManagedCatalogEntry(reportId, "countries", "draft", "Draft", null, null, null)]
                : []
        };
        var files = new GlobalCrystalReportTestFiles();
        var data = new StubDataSource();
        var renderer = new StubRenderer();
        var handler = new RenderGlobalCrystalReportQueryHandler(data, renderer, store, files,
            contracts, identities, Errors(), GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var result = await handler.Handle(new RenderGlobalCrystalReportQuery(
            managedDraft ? identities.SourceId(reportId) : SourceId, "countries", Sha256, "en", null), default);
        Assert.True(result.IsFailure);
        Assert.Equal(managedDraft ? "CrystalReport.DeploymentSourceChanged" : "CrystalReport.NotFound", result.Error.Code);
        Assert.Equal(0, files.Reads);
        Assert.Null(data.EntityKey);
        Assert.Null(renderer.Request);
    }

    [Fact]
    public async Task UnsupportedEntity_IsRejectedBeforeTheManagedCatalogIsRead()
    {
        var store = new GlobalCrystalReportTestStore();
        var handler = new GetGlobalCrystalReportsQueryHandler(store, ManagedCrystalReportContractRegistry.LoadEmbedded(),
            new GlobalCrystalReportIdentity(), Errors(), GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var result = await handler.Handle(new GetGlobalCrystalReportsQuery("fiscalyears"), default);
        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.RenderUnsupported", result.Error.Code);
        Assert.Equal(0, store.CatalogReads);
    }

    private static GlobalCrystalManagedCatalogEntry PublishedEntry(string entityKey, string key,
        ManagedCrystalReportContractRegistry contracts)
    {
        var reportId = Guid.NewGuid();
        var version = GlobalCrystalReportVersion.Create(reportId, 1, "private.rpt", "Countries.rpt",
            32, Sha256, key, null, contracts.SchemaVersion, contracts.Fingerprint);
        return new GlobalCrystalManagedCatalogEntry(reportId, entityKey, key, key, null, version, null);
    }

    [Theory]
    [InlineData(CrystalReportRenderFailure.SourceRejected, "CrystalReport.SourceRejected")]
    [InlineData(CrystalReportRenderFailure.SchemaMismatch, "CrystalReport.SchemaMismatch")]
    [InlineData(CrystalReportRenderFailure.ParameterMismatch, "CrystalReport.ParameterMismatch")]
    [InlineData(CrystalReportRenderFailure.UnsupportedEntity, "CrystalReport.RenderUnsupported")]
    public async Task Render_ReturnsTheSpecificTemplateFailure(
        CrystalReportRenderFailure failure,
        string expectedCode)
    {
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var identities = new GlobalCrystalReportIdentity();
        var report = PublishedEntry("countries", "published", contracts);
        var version = report.PublishedVersion!;
        var handler = new RenderGlobalCrystalReportQueryHandler(
            new StubDataSource(), new StubRenderer(failure), new GlobalCrystalReportTestStore { Catalog = [report] },
            new GlobalCrystalReportTestFiles(), contracts, identities, Errors(),
            GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var result = await handler.Handle(new RenderGlobalCrystalReportQuery(identities.SourceId(report.ReportId),
            "countries", identities.Token(version.Id, contracts.Fingerprint, version.Sha256), "en", null), default);

        Assert.False(result.IsSuccess);
        Assert.Equal(expectedCode, result.Error.Code);
    }

    private static CrystalReportErrors Errors() => new(new EchoLocalizer());

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ManagedRender_UsesPublishedPrivateSource_AndRejectsAnOldVersionToken(bool stale)
    {
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var identities = new GlobalCrystalReportIdentity();
        var reportId = Guid.NewGuid();
        var version = GlobalCrystalReportVersion.Create(reportId, 2, "private.rpt", "Countries.rpt",
            32, Sha256, "Managed", null, contracts.SchemaVersion, contracts.Fingerprint);
        var store = new GlobalCrystalReportTestStore
        {
            Catalog = [new GlobalCrystalManagedCatalogEntry(reportId, "countries", "countries-directory",
                "Managed", null, version, null)]
        };
        var renderer = new StubRenderer();
        var data = new StubDataSource();
        var files = new GlobalCrystalReportTestFiles();
        var filters = new Dictionary<string, string?> { ["NameEn"] = "Egypt" };
        var handler = new RenderGlobalCrystalReportQueryHandler(data, renderer,
            store, files, contracts, identities, Errors(), GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var result = await handler.Handle(new RenderGlobalCrystalReportQuery(identities.SourceId(reportId),
            "countries", stale ? new string('f', 64) : identities.Token(version.Id, contracts.Fingerprint, version.Sha256),
            "ar", filters), default);

        Assert.Equal(!stale, result.IsSuccess);
        if (stale)
        {
            Assert.Equal("CrystalReport.DeploymentSourceChanged", result.Error.Code);
            Assert.Null(renderer.Request);
            Assert.Equal(0, files.Reads);
            Assert.Null(data.EntityKey);
        }
        else
        {
            Assert.NotNull(renderer.Request);
            Assert.Equal("ar", renderer.Request.Language);
            Assert.Equal("countries", data.EntityKey);
            Assert.Same(filters, data.Filters);
            Assert.Equal("Countries.rpt", renderer.Request.OriginalFileName);
            Assert.Equal("<ReportData />", renderer.Request.DataXml);
            Assert.Equal(1, files.Reads);
            await result.Value.Content.DisposeAsync();
        }
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ManagedViewRender_UsesPersistedBindingAndNeverFallsBack(bool rejectView)
    {
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var identities = new GlobalCrystalReportIdentity();
        var reportId = Guid.NewGuid();
        var version = GlobalCrystalReportVersion.Create(reportId, 1, "private.rpt", "Countries.rpt",
            32, Sha256, "View report", null, contracts.SchemaVersion, contracts.Fingerprint);
        var store = new GlobalCrystalReportTestStore { Catalog = [new GlobalCrystalManagedCatalogEntry(reportId,
            "countries", "countries-view", "View report", null, version, null)
            { ViewName = "dbo.vw_Countries", ViewFingerprint = new string('e', 64) }] };
        var data = new StubDataSource();
        var renderer = new StubRenderer();
        var views = new StubViews(rejectView);
        var handler = new RenderGlobalCrystalReportQueryHandler(data, renderer,
            store, new GlobalCrystalReportTestFiles(), contracts, identities, Errors(),
            GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess(), views);
        var result = await handler.Handle(new RenderGlobalCrystalReportQuery(identities.SourceId(reportId),
            "countries", identities.Token(version.Id, contracts.Fingerprint, version.Sha256), "en", null), default);
        Assert.Equal(!rejectView, result.IsSuccess);
        Assert.Equal(("countries", "dbo.vw_Countries", new string('e', 64)), views.Binding);
        Assert.Null(data.EntityKey);
        if (rejectView) { Assert.Equal("CrystalReport.InvalidView", result.Error.Code); Assert.Null(renderer.Request); }
        else { Assert.Equal("<ViewData />", renderer.Request!.DataXml); await result.Value.Content.DisposeAsync(); }
    }

    [Theory]
    [InlineData(false, false)]
    [InlineData(true, false)]
    [InlineData(true, true)]
    public async Task CompanyConsumption_UsesOnlyGrantedCurrentVersions_AndSeparatesSourceDownload(bool granted, bool stale)
    {
        var contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var identities = new GlobalCrystalReportIdentity();
        var reportId = Guid.NewGuid();
        var version = GlobalCrystalReportVersion.Create(reportId, 1, "private.rpt", "Countries.rpt",
            32, Sha256, "Granted directory", null, contracts.SchemaVersion, contracts.Fingerprint);
        var access = new GlobalCrystalReportTestAccess
        {
            Granted = granted,
            Rights = CrystalReportRight.Run,
            Catalog = [new GlobalCrystalManagedCatalogEntry(reportId, "countries", "countries-directory", "Granted directory", null, version, null)]
        };
        var policy = new GlobalCrystalReportConsumerPolicy(new CompanyActor(), new CompanyPermissions());
        var store = new GlobalCrystalReportTestStore();
        var files = new GlobalCrystalReportTestFiles();
        var renderer = new StubRenderer();
        var catalog = await new GetGlobalCrystalReportsQueryHandler(store, contracts, identities, Errors(), policy, access)
            .Handle(new GetGlobalCrystalReportsQuery("countries"), default);
        Assert.True(catalog.IsSuccess);
        Assert.Equal(granted ? 1 : 0, catalog.Value.Count);
        if (granted) Assert.False(catalog.Value[0].CanDownloadSource);
        var token = stale ? new string('f', 64) : identities.Token(version.Id, contracts.Fingerprint, version.Sha256);
        var render = await new RenderGlobalCrystalReportQueryHandler(new StubDataSource(), renderer,
            store, files, contracts, identities, Errors(), policy, access)
            .Handle(new RenderGlobalCrystalReportQuery(identities.SourceId(reportId), "countries", token, "en", null), default);
        Assert.Equal(granted && !stale, render.IsSuccess);
        Assert.Equal(granted && !stale ? 1 : 0, files.Reads);
        if (render.IsSuccess) await render.Value.Content.DisposeAsync();
        else Assert.Null(renderer.Request);
        var download = await new DownloadPublishedGlobalCrystalReportQueryHandler(policy, store, access, identities, contracts, files, Errors())
            .Handle(new DownloadPublishedGlobalCrystalReportQuery(identities.SourceId(reportId), "countries", token), default);
        Assert.True(download.IsFailure);
    }

    [Theory]
    [InlineData(null, 1, false)]
    [InlineData("tenant-a", null, false)]
    [InlineData("tenant-a", 1, true)]
    public void CompanyConsumption_RequiresTrustedScope_AndDoesNotDowngradeASuperAdmin(string? tenantId, int? companyId, bool superAdmin)
    {
        var policy = new GlobalCrystalReportConsumerPolicy(new CompanyActor(tenantId, companyId, superAdmin), new CompanyPermissions());
        Assert.False(policy.Allows("countries"));
        Assert.False(policy.Allows("countries", download: true));
    }

    private sealed class CompanyActor(string? tenantId = "tenant-a", int? companyId = 1, bool superAdmin = false) : ICurrentActor
    {
        public string? UserId => "company-user";
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
        public bool IsInRole(string role) => superAdmin && role == "super_admin";
    }

    private sealed class CompanyPermissions : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => permission is "CrystalReports:View" or "CrystalReports:Download" or "Countries:View";
    }

    private sealed class StubDataSource : ICrystalReportDataSource
    {
        public string? EntityKey { get; private set; }
        public IReadOnlyDictionary<string, string?>? Filters { get; private set; }

        public Task<CrystalReportDataBuildResult> BuildAsync(
            string entityKey,
            IReadOnlyDictionary<string, string?> filters,
            CancellationToken cancellationToken)
        {
            EntityKey = entityKey;
            Filters = filters;
            return Task.FromResult(new CrystalReportDataBuildResult(
                new CrystalReportDataSet("<ReportData />"),
                CrystalReportDataFailure.None));
        }
    }
    private sealed class StubViews(bool reject) : IGlobalCrystalReportViewSource
    {
        public (string Source, string View, string Fingerprint)? Binding { get; private set; }
        public Task<GlobalCrystalReportViewBinding?> InspectAsync(string sourceKey, string viewName, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Render uses persisted bindings, never user input.");
        public Task<CrystalReportDataBuildResult> BuildAsync(string sourceKey, string viewName, string fingerprint,
            IReadOnlyDictionary<string, string?> filters, CancellationToken cancellationToken)
        {
            Binding = (sourceKey, viewName, fingerprint);
            return Task.FromResult(reject ? new CrystalReportDataBuildResult(null, CrystalReportDataFailure.Unsupported)
                : new CrystalReportDataBuildResult(new CrystalReportDataSet("<ViewData />"), CrystalReportDataFailure.None));
        }
    }

    private sealed class StubRenderer(CrystalReportRenderFailure failure = CrystalReportRenderFailure.None)
        : ICrystalReportRenderer
    {
        public CrystalReportRuntimeRequest? Request { get; private set; }

        public Task<CrystalReportRenderResult> RenderAsync(
            CrystalReportRuntimeRequest request,
            CancellationToken cancellationToken)
        {
            Request = request;
            if (failure != CrystalReportRenderFailure.None)
                return Task.FromResult(new CrystalReportRenderResult(null, failure));
            var bytes = "%PDF-global-report"u8.ToArray();
            return Task.FromResult(new CrystalReportRenderResult(
                new CrystalReportDownload(
                    new MemoryStream(bytes, writable: false),
                    "countries.pdf",
                    "application/pdf",
                    bytes.Length),
                CrystalReportRenderFailure.None));
        }
    }

    private sealed class EchoLocalizer : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string name] => new(name, name);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(System.Globalization.CultureInfo.InvariantCulture, name, arguments));

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
