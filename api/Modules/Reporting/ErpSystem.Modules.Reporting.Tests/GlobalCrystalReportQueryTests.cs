using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportQueryTests
{
    private const string SourceId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    private const string Sha256 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

    [Fact]
    public async Task Catalog_ReturnsOnlyRunnableReportsForTheRequestedGlobalEntity()
    {
        var deployment = new StubDeploymentSource([
            Descriptor(SourceId, "countries", isImportable: true),
            Descriptor(new string('c', 64), "countries", isImportable: false),
            Descriptor(new string('d', 64), "states", isImportable: true)
        ]);
        var handler = new GetGlobalCrystalReportsQueryHandler(deployment, Errors());

        var result = await handler.Handle(
            new GetGlobalCrystalReportsQuery("COUNTRIES"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        var report = Assert.Single(result.Value);
        Assert.Equal(SourceId, report.Id);
        Assert.Equal("countries", report.EntityKey);
        Assert.Equal(Sha256, report.RowVersion);
        Assert.True(report.IsPublished);
        Assert.False(report.IsArchived);
        Assert.Equal("countries", deployment.LastListedEntityKey);
    }

    [Fact]
    public async Task Render_UsesTheExactCatalogHashAndGlobalDataSource()
    {
        var sourceBytes = "deployment-rpt"u8.ToArray();
        var deployment = new StubDeploymentSource(
            [Descriptor(SourceId, "countries", isImportable: true)],
            new CrystalReportDeploymentDownloadResult(
                new FileUpload(
                    "Countries.rpt",
                    "application/octet-stream",
                    sourceBytes.Length,
                    () => new MemoryStream(sourceBytes, writable: false)),
                CrystalReportDeploymentDownloadFailure.None));
        var dataSource = new StubDataSource();
        var renderer = new StubRenderer();
        var handler = new RenderGlobalCrystalReportQueryHandler(
            deployment,
            dataSource,
            renderer,
            Errors());
        var filters = new Dictionary<string, string?> { ["NameEn"] = "Egypt" };

        var result = await handler.Handle(
            new RenderGlobalCrystalReportQuery(SourceId, "countries", Sha256, "en", filters),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("countries.pdf", result.Value.FileName);
        Assert.Equal((SourceId, Sha256), deployment.LastDownload);
        Assert.Equal("countries", dataSource.EntityKey);
        Assert.Same(filters, dataSource.Filters);
        Assert.NotNull(renderer.Request);
        Assert.Equal("countries", renderer.Request!.EntityKey);
        Assert.Equal("Countries.rpt", renderer.Request.OriginalFileName);
        Assert.Equal("<ReportData />", renderer.Request.DataXml);
    }

    [Fact]
    public async Task Render_RejectsAChangedDeploymentHashBeforeDownloadingTheSource()
    {
        var deployment = new StubDeploymentSource([
            Descriptor(SourceId, "countries", isImportable: true)
        ]);
        var handler = new RenderGlobalCrystalReportQueryHandler(
            deployment,
            new StubDataSource(),
            new StubRenderer(),
            Errors());

        var result = await handler.Handle(
            new RenderGlobalCrystalReportQuery(
                SourceId,
                "countries",
                new string('c', 64),
                "en",
                null),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.DeploymentSourceChanged", result.Error.Code);
        Assert.Null(deployment.LastDownload);
    }

    [Fact]
    public async Task UnsupportedEntity_IsRejectedBeforeTheDeploymentCatalogIsRead()
    {
        var deployment = new StubDeploymentSource([]);
        var handler = new GetGlobalCrystalReportsQueryHandler(deployment, Errors());

        var result = await handler.Handle(
            new GetGlobalCrystalReportsQuery("fiscalyears"),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.RenderUnsupported", result.Error.Code);
        Assert.Equal(0, deployment.ListCalls);
    }

    private static DeploymentCrystalReportDescriptor Descriptor(
        string sourceId,
        string entityKey,
        bool isImportable) =>
        new(
            sourceId,
            entityKey,
            $"{entityKey}-directory",
            "Countries.rpt",
            "Countries directory",
            "Countries directory report",
            128,
            Sha256,
            new DateTime(2026, 9, 22, 0, 0, 0, DateTimeKind.Utc),
            isImportable,
            isImportable ? null : "Invalid report");

    private static CrystalReportErrors Errors() => new(new EchoLocalizer());

    private sealed class StubDeploymentSource(
        IReadOnlyList<DeploymentCrystalReportDescriptor> catalog,
        CrystalReportDeploymentDownloadResult? download = null) : ICrystalReportDeploymentSource
    {
        public int ListCalls { get; private set; }
        public string? LastListedEntityKey { get; private set; }
        public (string SourceId, string ExpectedSha256)? LastDownload { get; private set; }

        public Task<IReadOnlyList<DeploymentCrystalReportDescriptor>?> ListAsync(
            string? entityKey,
            CancellationToken cancellationToken)
        {
            ListCalls++;
            LastListedEntityKey = entityKey;
            return Task.FromResult<IReadOnlyList<DeploymentCrystalReportDescriptor>?>(catalog);
        }

        public Task<CrystalReportDeploymentDownloadResult> DownloadAsync(
            string sourceId,
            string expectedSha256,
            CancellationToken cancellationToken)
        {
            LastDownload = (sourceId, expectedSha256);
            return Task.FromResult(download ?? new CrystalReportDeploymentDownloadResult(
                null,
                CrystalReportDeploymentDownloadFailure.Unavailable));
        }
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

    private sealed class StubRenderer : ICrystalReportRenderer
    {
        public CrystalReportRuntimeRequest? Request { get; private set; }

        public Task<CrystalReportRenderResult> RenderAsync(
            CrystalReportRuntimeRequest request,
            CancellationToken cancellationToken)
        {
            Request = request;
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
