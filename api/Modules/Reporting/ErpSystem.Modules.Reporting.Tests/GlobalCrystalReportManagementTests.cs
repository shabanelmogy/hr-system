using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Security;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.DependencyInjection;
using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using MediatR;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportManagementTests
{
    private static readonly ManagedCrystalReportContractRegistry Contracts = ManagedCrystalReportContractRegistry.LoadEmbedded();

    [Fact]
    public async Task Create_ReportsRejectedSourceWithoutCreatingARecordOrPublishing()
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var files = new GlobalCrystalReportTestFiles { Failure = CrystalReportFileFailure.SourceRejected };
        var handler = new CreateGlobalCrystalReportCommandHandler(new GlobalCrystalReportStore(context), files, context, Policy(), Contracts, Errors());
        var result = await handler.Handle(new CreateGlobalCrystalReportCommand("countries", null, Upload()), default);
        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.SourceRejected", result.Error.Code);
        Assert.Empty(await context.GlobalCrystalReports.ToArrayAsync());
        Assert.Empty(await context.GlobalCrystalReportVersions.ToArrayAsync());
        Assert.Equal(0, files.Deletes);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task AccessEditorCanReadTheAcl_WhileArchivedReportsStayReadOnly(bool archived)
    {
        var report = GlobalCrystalReport.Create("countries", "countries-directory", null);
        if (archived) report.Archive();
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var store = new GlobalCrystalReportStore(context);
        store.Add(report);
        await context.SaveChangesAsync();
        var policy = new GlobalCrystalReportPolicy(new Actor(true), new Permissions([
            ReportingPermissions.ViewGlobalCrystalReports, ReportingPermissions.EditGlobalCrystalReportAccess, "Countries:Edit"]));
        var result = await new GetGlobalCrystalReportAccessQueryHandler(store, new GlobalCrystalReportTestAccess(), policy, Errors())
            .Handle(new GetGlobalCrystalReportAccessQuery(report.Id), default);
        Assert.True(result.IsSuccess);
        Assert.True(result.Value.CanView);
        Assert.Equal(!archived, result.Value.CanEdit);
    }

    [Fact]
    public async Task Discovery_ReportsRegisteredAndRejectedFilesWithServerSearchAndPaging()
    {
        var store = new GlobalCrystalReportTestStore
        {
            Catalog = [new GlobalCrystalManagedCatalogEntry(Guid.NewGuid(), "countries", "countries-directory", "Draft", null, null, null)]
        };
        var source = new RegistrationSource([
            Candidate("countries-directory", "Existing", true),
            Candidate("countries-empty", "Empty", false),
            Candidate("countries-fresh", "Fresh", true)
        ]);
        var handler = new GetGlobalCrystalReportCandidatesQueryHandler(source, store, Policy(), Errors());
        var result = await handler.Handle(new GetGlobalCrystalReportCandidatesQuery("countries"), default);
        Assert.True(result.IsSuccess);
        Assert.Equal(3, result.Value.TotalCount);
        Assert.True(Assert.Single(result.Value.Items, item => item.ReportKey == "countries-directory").IsImported);
        Assert.Equal("Empty file", Assert.Single(result.Value.Items, item => !item.IsImportable).ValidationReason);
        var filtered = await handler.Handle(new GetGlobalCrystalReportCandidatesQuery("countries", "existing", 1, 1), default);
        Assert.Single(filtered.Value.Items);
        Assert.Equal(1, filtered.Value.TotalCount);
        var secondPage = await handler.Handle(new GetGlobalCrystalReportCandidatesQuery("countries", null, 2, 1), default);
        Assert.Equal("Existing", Assert.Single(secondPage.Value.Items).DisplayName);
        Assert.Equal(0, source.Downloads);
    }

    [Fact]
    public async Task RegisterExistingFile_CreatesDraftVersionOneAndNeverPublishesOrOverwritesIt()
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var store = new GlobalCrystalReportStore(context);
        var files = new GlobalCrystalReportTestFiles();
        var services = new ServiceCollection();
        services.AddMediatR(config => config.RegisterServicesFromAssemblyContaining<CreateGlobalCrystalReportCommand>());
        services.AddSingleton<IGlobalCrystalReportStore>(store);
        services.AddSingleton<ICrystalReportFileStorage>(files);
        services.AddSingleton<IReportingUnitOfWork>(context);
        services.AddSingleton(Policy());
        services.AddSingleton<IManagedCrystalReportContractSource>(Contracts);
        services.AddSingleton(Errors());
        await using var provider = services.BuildServiceProvider();
        var candidate = Candidate("countries-directory", "Existing", true);
        var source = new RegistrationSource([candidate]);
        var handler = new ImportGlobalCrystalReportCommandHandler(Policy(), source, provider.GetRequiredService<ISender>(), Errors());
        var request = new ImportGlobalCrystalReportCommand("countries", candidate.SourceId, candidate.Sha256);
        var result = await handler.Handle(request, default);
        Assert.True(result.IsSuccess);
        Assert.False(result.Value.IsPublished);
        var version = Assert.Single(result.Value.Versions);
        Assert.Equal(1, version.VersionNumber);
        Assert.False(version.IsPublished);
        Assert.Equal("Countries.Directory.rpt", version.OriginalFileName);
        var duplicate = await handler.Handle(request, default);
        Assert.Equal("CrystalReport.DuplicateKey", duplicate.Error.Code);
        Assert.Equal(1, files.Writes);
        Assert.Single(await context.GlobalCrystalReports.ToListAsync());
        Assert.Single(await context.GlobalCrystalReportVersions.ToListAsync());
    }

    private static DeploymentCrystalReportDescriptor Candidate(string key, string title, bool importable) =>
        new(new string(key == "countries-directory" ? 'a' : key == "countries-empty" ? 'c' : 'd', 64), "countries", key,
            key == "countries-directory" ? "Countries.Directory.rpt" : key + ".rpt", title, null,
            importable ? 32 : 0, importable ? new string('b', 64) : "", DateTime.UnixEpoch, importable,
            importable ? null : "Empty file");

    private sealed class RegistrationSource(IReadOnlyList<DeploymentCrystalReportDescriptor> catalog) : ICrystalReportDeploymentSource
    {
        public int Downloads { get; private set; }
        public Task<IReadOnlyList<DeploymentCrystalReportDescriptor>?> ListAsync(string? entityKey, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<DeploymentCrystalReportDescriptor>?>(catalog);
        public Task<CrystalReportDeploymentDownloadResult> DownloadAsync(string sourceId, string expectedSha256, CancellationToken cancellationToken)
        {
            Downloads++;
            var item = catalog.Single(entry => entry.SourceId == sourceId && entry.Sha256 == expectedSha256);
            return Task.FromResult(new CrystalReportDeploymentDownloadResult(new FileUpload(item.FileName,
                "application/octet-stream", 32, () => new MemoryStream(new byte[32])), CrystalReportDeploymentDownloadFailure.None));
        }
    }

    [Theory]
    [InlineData(false, "countries", "Countries:Edit", false)]
    [InlineData(true, "countries", "Countries:View", false)]
    [InlineData(true, "countries", "*", false)]
    [InlineData(true, "fiscalyears", "FiscalYears:Edit", false)]
    [InlineData(true, "states", "Countries:Edit", false)]
    [InlineData(true, "countries", "Countries:Edit", true)]
    public void Policy_RequiresExactRoleAndEntityAuthority(bool superAdmin, string entity, string permission, bool expected)
    {
        var policy = new GlobalCrystalReportPolicy(new Actor(superAdmin), new Permissions(["GlobalCrystalReports:View", permission]));
        Assert.Equal(expected, policy.Allows(entity));
    }

    [Fact]
    public async Task GlobalAndTenantRows_AreIsolatedWithoutTenantFilterBypass()
    {
        var database = Guid.NewGuid().ToString();
        await using (var admin = Context(database, new Actor(true)))
        {
            var report = GlobalCrystalReport.Create("countries", "countries-directory", null);
            report.AddVersion(Version(report.Id, 1));
            admin.GlobalCrystalReports.Add(report);
            await admin.SaveChangesAsync();
            Assert.Empty(await admin.CrystalReports.ToArrayAsync());
        }
        await using (var tenant = Context(database, new Actor(false)))
        {
            Assert.Empty(await tenant.GlobalCrystalReports.ToArrayAsync());
            Assert.Empty(await tenant.GlobalCrystalReportVersions.ToArrayAsync());
            var report = CrystalReport.Create("countries", "countries-tenant", "Tenant", null);
            tenant.CrystalReports.Add(report);
            await tenant.SaveChangesAsync();
        }
        await using (var admin = Context(database, new Actor(true)))
        {
            Assert.Single(await admin.GlobalCrystalReports.ToArrayAsync());
            Assert.Empty(await admin.CrystalReports.ToArrayAsync());
        }
    }

    [Fact]
    public async Task UploadAppendsWithoutPublishing_AndPublishRequiresCurrentEvidenceAndRowVersion()
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var store = new GlobalCrystalReportStore(context);
        var files = new GlobalCrystalReportTestFiles();
        var policy = Policy();
        var create = new CreateGlobalCrystalReportCommandHandler(store, files, context, policy, Contracts, Errors());
        var created = await create.Handle(new CreateGlobalCrystalReportCommand("countries", null, Upload()), default);
        Assert.True(created.IsSuccess);
        Assert.False(created.Value.IsPublished);
        var report = await store.FindAsync(created.Value.Id, default);
        Assert.NotNull(report);
        report.RowVersion = new byte[8];
        await context.SaveChangesAsync();
        var publish = new PublishGlobalCrystalReportVersionCommandHandler(store, policy, context, Contracts, Errors(), new GlobalCrystalReportTestAccess());
        var first = Assert.Single(created.Value.Versions);
        var published = await publish.Handle(new PublishGlobalCrystalReportVersionCommand(report.Id, first.Id,
            Convert.ToBase64String(new byte[8])), default);
        Assert.True(published.IsSuccess);
        var upload = new UploadGlobalCrystalReportVersionCommandHandler(store, files, context, policy, Contracts, Errors(), new GlobalCrystalReportTestAccess());
        var appended = await upload.Handle(new UploadGlobalCrystalReportVersionCommand(report.Id, Upload()), default);
        Assert.True(appended.IsSuccess);
        Assert.Equal(2, appended.Value.Versions.Count);
        Assert.Equal(first.Id, Assert.Single(appended.Value.Versions, x => x.IsPublished).Id);
        var stale = await publish.Handle(new PublishGlobalCrystalReportVersionCommand(report.Id,
            appended.Value.Versions[0].Id, Convert.ToBase64String(Enumerable.Repeat((byte)1, 8).ToArray())), default);
        Assert.Equal("CrystalReport.ConcurrencyConflict", stale.Error.Code);
        var version = await store.VersionAsync(report.Id, appended.Value.Versions[0].Id, default);
        Assert.NotNull(version);
        version.RecordValidation(false, "Fixture invalid", 1, Contracts.Fingerprint);
        await context.SaveChangesAsync();
        var invalid = await publish.Handle(new PublishGlobalCrystalReportVersionCommand(report.Id, version.Id,
            Convert.ToBase64String(report.RowVersion)), default);
        Assert.Equal("CrystalReport.VersionNotValidated", invalid.Error.Code);
        Assert.Equal(first.Id, report.CurrentPublishedVersionId);
    }

    [Fact]
    public async Task RejectedUploadOrForeignEntity_DoesNotChangePriorVersions()
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var report = GlobalCrystalReport.Create("states", "states-directory", null);
        report.AddVersion(Version(report.Id, 1));
        context.GlobalCrystalReports.Add(report);
        await context.SaveChangesAsync();
        var files = new GlobalCrystalReportTestFiles();
        var handler = new UploadGlobalCrystalReportVersionCommandHandler(new GlobalCrystalReportStore(context), files,
            context, Policy(["Countries:Edit"]), Contracts, Errors(), new GlobalCrystalReportTestAccess());
        var denied = await handler.Handle(new UploadGlobalCrystalReportVersionCommand(report.Id, Upload()), default);
        Assert.Equal("CrystalReport.NotFound", denied.Error.Code);
        Assert.Equal(0, files.Writes);
        Assert.Single(report.Versions);
    }

    [Theory]
    [InlineData("StorageKey")]
    [InlineData("Sha256")]
    [InlineData("VersionNumber")]
    public async Task PersistedSourceIdentity_IsAppendOnly(string property)
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var report = GlobalCrystalReport.Create("countries", "countries-directory", null);
        var version = Version(report.Id, 1);
        report.AddVersion(version);
        context.GlobalCrystalReports.Add(report);
        await context.SaveChangesAsync();
        var entry = context.Entry(version).Property(property);
        entry.CurrentValue = property == "VersionNumber" ? 99 : "tampered";
        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());
        Assert.Contains("append-only", error.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ManagedDraftShadowsDeploymentWithoutPublishingOrSilentFallback()
    {
        var id = Guid.NewGuid();
        var store = new GlobalCrystalReportTestStore
        {
            Catalog = [new GlobalCrystalManagedCatalogEntry(id, "countries", "countries-directory", "Draft", null, null, null)]
        };
        var handler = new GetGlobalCrystalReportsQueryHandler(store, Contracts, new GlobalCrystalReportIdentity(), Errors(), GlobalCrystalReportTestAccess.PlatformPolicy, new GlobalCrystalReportTestAccess());
        var response = await handler.Handle(new GetGlobalCrystalReportsQuery("countries"), default);
        Assert.True(response.IsSuccess);
        Assert.Empty(response.Value);
    }

    [Fact]
    public void SchemaExportsTheExactOrderedTypesAndNullability()
    {
        using var schema = new MemoryStream(Contracts.ExportSchema("countries"));
        using var data = new System.Data.DataSet();
        using var xml = System.Xml.XmlReader.Create(schema, new System.Xml.XmlReaderSettings
        {
            DtdProcessing = System.Xml.DtdProcessing.Prohibit, XmlResolver = null
        });
        data.ReadXmlSchema(xml);
        var table = data.Tables["ReportData"];
        Assert.NotNull(table);
        Assert.Equal(6, table.Columns.Count);
        Assert.Equal(typeof(int), table.Columns["CountryId"]!.DataType);
        Assert.False(table.Columns["CountryAr"]!.AllowDBNull);
        Assert.True(table.Columns["StateId"]!.AllowDBNull);
    }

    [Fact]
    public async Task EmptyDraft_BindsApprovedSource_AndFirstUploadStartsAtVersionOne()
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var store = new GlobalCrystalReportStore(context);
        var handler = new CreateGlobalCrystalReportDraftCommandHandler(store, context, Policy(),
            new CrystalReportDesignSourceCatalog(Contracts), Errors(), new DraftViews());
        var request = new CreateGlobalCrystalReportDraftCommand("reference-data", "countries",
            "countries-empty", "  Empty directory  ", "Draft description", Contracts.Fingerprint, "dbo.vw_Countries");
        var result = await handler.Handle(request, default);
        Assert.True(result.IsSuccess);
        Assert.Equal("Empty directory", result.Value.DisplayName);
        Assert.Equal("countries", result.Value.EntityKey);
        Assert.Equal("dbo.vw_Countries", result.Value.ViewName);
        Assert.Equal(new string('d', 64), result.Value.ViewFingerprint);
        Assert.Empty(result.Value.Versions);
        Assert.False(result.Value.IsPublished);
        Assert.Null(result.Value.CurrentVersionNumber);
        Assert.Empty(await context.GlobalCrystalReportVersions.ToArrayAsync());
        var duplicate = await handler.Handle(request, default);
        Assert.Equal("CrystalReport.DuplicateKey", duplicate.Error.Code);
        Assert.Single(await context.GlobalCrystalReports.ToArrayAsync());
        var files = new GlobalCrystalReportTestFiles();
        var upload = new UploadGlobalCrystalReportVersionCommandHandler(store, files, context,
            Policy(), Contracts, Errors(), new GlobalCrystalReportTestAccess());
        var uploaded = await upload.Handle(new UploadGlobalCrystalReportVersionCommand(result.Value.Id, Upload()), default);
        Assert.True(uploaded.IsSuccess);
        Assert.Equal(1, Assert.Single(uploaded.Value.Versions).VersionNumber);
        Assert.False(uploaded.Value.IsPublished);
    }

    [Theory]
    [InlineData("wrong-module", "countries", "countries-test", "name", false, "CrystalReport.UnsupportedEntity")]
    [InlineData("reference-data", "countries", "countries-test", "name", true, "CrystalReport.ContractStale")]
    [InlineData("reference-data", "countries", "states-test", "name", false, "CrystalReport.InvalidDraft")]
    [InlineData("reference-data", "countries", "countries-test", "  ", false, "CrystalReport.InvalidDraft")]
    [InlineData("reference-data", "unknown", "unknown-test", "name", false, "CrystalReport.Forbidden")]
    public async Task EmptyDraft_RejectsInvalidBindingWithoutPersisting(
        string module, string source, string key, string name, bool stale, string code)
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(true));
        var handler = new CreateGlobalCrystalReportDraftCommandHandler(new GlobalCrystalReportStore(context),
            context, Policy(), new CrystalReportDesignSourceCatalog(Contracts), Errors());
        var result = await handler.Handle(new CreateGlobalCrystalReportDraftCommand(module, source, key, name,
            null, stale ? new string('a', 64) : Contracts.Fingerprint), default);
        Assert.Equal(code, result.Error.Code);
        Assert.Empty(await context.GlobalCrystalReports.ToArrayAsync());
    }

    [Theory]
    [InlineData(false, true, true)]
    [InlineData(true, false, true)]
    [InlineData(true, true, false)]
    public async Task EmptyDraft_RequiresRoleCreateAndSourceEdit(bool role, bool create, bool edit)
    {
        await using var context = Context(Guid.NewGuid().ToString(), new Actor(role));
        var grants = new List<string> { ReportingPermissions.ViewGlobalCrystalReports };
        if (create) grants.Add(ReportingPermissions.CreateGlobalCrystalReports);
        if (edit) grants.Add("Countries:Edit");
        var handler = new CreateGlobalCrystalReportDraftCommandHandler(new GlobalCrystalReportStore(context), context,
            new GlobalCrystalReportPolicy(new Actor(role), new Permissions(grants.ToArray())),
            new CrystalReportDesignSourceCatalog(Contracts), Errors());
        var result = await handler.Handle(new CreateGlobalCrystalReportDraftCommand("reference-data", "countries",
            "countries-empty", "Empty", null, Contracts.Fingerprint), default);
        Assert.Equal("CrystalReport.Forbidden", result.Error.Code);
        Assert.Empty(await context.GlobalCrystalReports.ToArrayAsync());
    }

    [Fact]
    public async Task DesignerCatalogAndPackage_UsePermissionFilteredCanonicalMetadataOnly()
    {
        var catalog = new CrystalReportDesignSourceCatalog(Contracts);
        var sources = await new GetGlobalCrystalReportDesignSourcesQueryHandler(catalog, Policy(["Countries:Edit"]))
            .Handle(new GetGlobalCrystalReportDesignSourcesQuery(), default);
        var source = Assert.Single(sources);
        Assert.Equal("reference-data", source.ModuleKey);
        Assert.Equal("countries", source.SourceKey);
        Assert.Equal(6, source.Columns.Count);
        Assert.Equal("Language", Assert.Single(source.Parameters).Name);
        Assert.Equal(Contracts.Fingerprint, source.ContractFingerprint);
        var handler = new DownloadGlobalCrystalReportDesignerPackageQueryHandler(catalog, Contracts, Policy(["Countries:Edit"]), Errors());
        var denied = await handler.Handle(new DownloadGlobalCrystalReportDesignerPackageQuery("states"), default);
        Assert.Equal("CrystalReport.Forbidden", denied.Error.Code);
        var result = await handler.Handle(new DownloadGlobalCrystalReportDesignerPackageQuery("countries"), default);
        Assert.True(result.IsSuccess);
        using var archive = new System.IO.Compression.ZipArchive(result.Value.Content);
        Assert.Equal(["README.txt", "countries.xsd", "source.json"], archive.Entries.Select(entry => entry.FullName).Order(StringComparer.Ordinal).ToArray());
        using var schema = new MemoryStream();
        await archive.GetEntry("countries.xsd")!.Open().CopyToAsync(schema);
        Assert.Equal(Contracts.ExportSchema("countries"), schema.ToArray());
        using var metadata = new StreamReader(archive.GetEntry("source.json")!.Open());
        var json = await metadata.ReadToEndAsync();
        Assert.Contains(Contracts.Fingerprint, json, StringComparison.Ordinal);
        Assert.DoesNotContain("connectionString", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData("countries-test", "Valid name", true)]
    [InlineData("../test", "Valid name", false)]
    [InlineData("countries-test", "   ", false)]
    public void EmptyDraftTransportValidator_RejectsMalformedIdentity(string key, string name, bool valid)
    {
        var validator = new CreateGlobalCrystalReportDraftCommandValidator();
        Assert.Equal(valid, validator.Validate(new CreateGlobalCrystalReportDraftCommand("reference-data", "countries",
            key, name, null, Contracts.Fingerprint, "dbo.vw_Countries")).IsValid);
    }

    [Theory]
    [InlineData("countries", true)]
    [InlineData("states", false)]
    [InlineData("unknown", false)]
    public async Task DatabaseViewDiscovery_RequiresOwningSourceCreateAuthorityBeforeMetadata(string source, bool allowed)
    {
        var catalog = new ViewCatalog();
        var handler = new GetGlobalCrystalReportDatabaseViewsQueryHandler(Policy(["Countries:Edit"]), catalog, Errors());
        var result = await handler.Handle(new GetGlobalCrystalReportDatabaseViewsQuery(source), default);
        Assert.Equal(allowed, result.IsSuccess);
        Assert.Equal(allowed ? 1 : 0, catalog.Calls);
        if (!allowed) Assert.Equal("CrystalReport.Forbidden", result.Error.Code);
    }

    [Fact]
    public async Task DatabaseViewDiscovery_PropagatesUnavailableAndValidatesBounds()
    {
        var catalog = new ViewCatalog { Unavailable = true };
        var result = await new GetGlobalCrystalReportDatabaseViewsQueryHandler(Policy(), catalog, Errors())
            .Handle(new GetGlobalCrystalReportDatabaseViewsQuery("countries"), default);
        Assert.Equal("CrystalReport.ViewCatalogUnavailable", result.Error.Code);
        var validator = new GetGlobalCrystalReportDatabaseViewsQueryValidator();
        Assert.False(validator.Validate(new GetGlobalCrystalReportDatabaseViewsQuery("countries", new string('a', 201), 0, 51)).IsValid);
        Assert.True(validator.Validate(new GetGlobalCrystalReportDatabaseViewsQuery("countries", "dbo.", 1, 20)).IsValid);
    }

    private sealed class ViewCatalog : IGlobalCrystalReportViewCatalog
    {
        public bool Unavailable { get; init; }
        public int Calls { get; private set; }
        public Task<CrystalReportDatabaseViewPage?> ListAsync(string sourceKey, string? search, int page, int pageSize, CancellationToken cancellationToken)
        {
            Calls++;
            return Task.FromResult<CrystalReportDatabaseViewPage?>(Unavailable ? null : new([], 0));
        }
    }

    private static ReportingDbContext Context(string name, Actor actor) =>
        new(new DbContextOptionsBuilder<ReportingDbContext>().UseInMemoryDatabase(name).Options, actor);
    private static GlobalCrystalReportVersion Version(Guid id, int number) =>
        GlobalCrystalReportVersion.Create(id, number, $"{Guid.NewGuid():N}.rpt", "countries-directory.rpt", 32,
            new string('b', 64), "Fixture", null, Contracts.SchemaVersion, Contracts.Fingerprint);
    private static FileUpload Upload() => new("countries-directory.rpt", "application/octet-stream", 32,
        () => new MemoryStream(new byte[32]));
    private static GlobalCrystalReportPolicy Policy(string[]? entityPermissions = null) =>
        new(new Actor(true), new Permissions([.. ReportingPermissions.GlobalReports, .. entityPermissions ?? ["Countries:Edit", "States:Edit", "Districts:Edit"]]));
    private static CrystalReportErrors Errors() => new(new Echo());
    private sealed class Actor(bool superAdmin) : ICurrentActor
    {
        public string UserId => "fixture";
        public string? TenantId => superAdmin ? null : "tenant";
        public int? CompanyId => superAdmin ? null : 1;
        public bool IsInRole(string role) => superAdmin && role == "super_admin";
    }
    private sealed class Permissions(string[] values) : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => values.Contains(permission, StringComparer.Ordinal);
    }
    private sealed class Echo : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
    private sealed class DraftViews : IGlobalCrystalReportViewSource
    {
        public Task<GlobalCrystalReportViewBinding?> InspectAsync(string sourceKey, string viewName, CancellationToken cancellationToken) =>
            Task.FromResult<GlobalCrystalReportViewBinding?>(new(viewName, new string('d', 64)));
        public Task<CrystalReportDataBuildResult> BuildAsync(string sourceKey, string viewName, string fingerprint,
            IReadOnlyDictionary<string, string?> filters, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Creating a draft must never execute the View.");
    }
    private sealed class Deployment : ICrystalReportDeploymentSource
    {
        public Task<IReadOnlyList<DeploymentCrystalReportDescriptor>?> ListAsync(string? entityKey, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<DeploymentCrystalReportDescriptor>?>([new(new string('c',64), "countries",
                "countries-directory", "Countries.Directory.rpt", "Directory", null, 32, new string('b',64), DateTime.UnixEpoch, true, null)]);
        public Task<CrystalReportDeploymentDownloadResult> DownloadAsync(string sourceId, string expectedSha256, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("Draft shadow must not download deployment bytes.");
    }
}
