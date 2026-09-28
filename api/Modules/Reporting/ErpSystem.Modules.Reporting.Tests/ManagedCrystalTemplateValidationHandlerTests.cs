using System.Globalization;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ManagedCrystalTemplateValidationHandlerTests
{
    private static readonly string CurrentFingerprint = new('a', 64);
    private static readonly string StaleFingerprint = new('b', 64);

    [Fact]
    public async Task SupportedEntities_ReturnCanonicalMetadataInStableOrder()
    {
        var handler = new GetSupportedCrystalReportEntitiesQueryHandler(
            new StubContracts(CurrentFingerprint, ["fiscalyears", "countries"]));

        var result = await handler.Handle(
            new GetSupportedCrystalReportEntitiesQuery(),
            CancellationToken.None);

        Assert.Equal(["countries", "fiscalyears"], result.Select(x => x.EntityKey));
        Assert.All(result, item =>
        {
            Assert.Equal(1, item.ContractSchemaVersion);
            Assert.Equal(CurrentFingerprint, item.ContractFingerprint);
            Assert.Equal("tenant-company", item.Scope);
            Assert.Equal(["code"], item.Filters);
        });
    }

    [Fact]
    public async Task Create_RejectsUnsupportedEntityBeforeOpeningOrStoringTheUpload()
    {
        var storage = new RecordingFileStorage();
        var handler = new CreateCrystalReportCommandHandler(
            new RecordingStore(),
            storage,
            new StubContracts(CurrentFingerprint, ["countries"]),
            new InlineUnitOfWork(),
            Errors());

        var result = await handler.Handle(
            new CreateCrystalReportCommand(
                "unknown-entity",
                null,
                Upload("unknown-entity-directory.rpt")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.UnsupportedEntity", result.Error.Code);
        Assert.Equal(0, storage.StoreCalls);
    }

    [Fact]
    public async Task AddVersion_PassesTheReportsEntityKeyToTemplateInspection()
    {
        var reportId = Guid.NewGuid();
        var storage = new RecordingFileStorage
        {
            StoreResult = new StoreCrystalReportFileResult(
                null,
                CrystalReportFileFailure.SchemaMismatch,
                "schema mismatch")
        };
        var store = new RecordingStore
        {
            Detail = Detail(reportId, "fiscalyears", isPublished: false)
        };
        var handler = new AddCrystalReportVersionCommandHandler(
            store,
            storage,
            new AllowAllPermissions(),
            new InlineUnitOfWork(),
            Errors());

        var result = await handler.Handle(
            new AddCrystalReportVersionCommand(
                reportId,
                Upload("fiscalyears-directory.rpt")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.SchemaMismatch", result.Error.Code);
        Assert.Equal("fiscalyears", storage.StoredEntityKey);
        Assert.Equal(1, storage.StoreCalls);
    }

    [Fact]
    public async Task Publish_RejectsVersionValidatedAgainstAnOlderContract()
    {
        var report = CrystalReport.Create(
            "countries",
            "countries-directory",
            "Countries directory",
            null);
        var version = Version(report.Id, StaleFingerprint);
        report.AddVersion(version);
        var unitOfWork = new InlineUnitOfWork();
        var handler = new PublishCrystalReportVersionCommandHandler(
            new RecordingStore { Aggregate = report, Version = version },
            new AllowAllPermissions(),
            new StubContracts(CurrentFingerprint, ["countries"]),
            unitOfWork,
            Errors());

        var result = await handler.Handle(
            new PublishCrystalReportVersionCommand(
                report.Id,
                version.Id,
                Convert.ToBase64String(new byte[8])),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.ContractStale", result.Error.Code);
        Assert.Equal(0, unitOfWork.SaveCalls);
        Assert.Null(report.CurrentPublishedVersionId);
    }

    [Fact]
    public async Task Render_RejectsStalePublishedVersionBeforeFileDataOrRuntimeWork()
    {
        var reportId = Guid.NewGuid();
        var version = Version(reportId, StaleFingerprint);
        var storage = new RecordingFileStorage();
        var dataSource = new RecordingDataSource();
        var renderer = new RecordingRenderer();
        var handler = new RenderCrystalReportQueryHandler(
            new RecordingStore
            {
                Detail = Detail(reportId, "countries", isPublished: true),
                Version = version
            },
            storage,
            dataSource,
            renderer,
            new AllowAllPermissions(),
            new StubContracts(CurrentFingerprint, ["countries"]),
            Errors());

        var result = await handler.Handle(
            new RenderCrystalReportQuery(reportId, "en", null),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.ContractStale", result.Error.Code);
        Assert.Equal(0, storage.OpenCalls);
        Assert.Equal(0, dataSource.BuildCalls);
        Assert.Equal(0, renderer.RenderCalls);
    }

    [Fact]
    public async Task Revalidate_UsesImmutableStoredSourceAndMarksCurrentEvidenceValid()
    {
        var report = CrystalReport.Create(
            "countries", "countries-directory", "Countries", null);
        var version = Version(report.Id, StaleFingerprint);
        version.MarkNeedsRevalidation("Contract changed");
        report.AddVersion(version);
        var store = new RecordingStore
        {
            Detail = Detail(report.Id, "countries", isPublished: false),
            Aggregate = report,
            Version = version
        };
        var storage = new RecordingFileStorage { OpenBytes = new byte[128] };
        var inspector = new RecordingInspector
        {
            Result = new CrystalReportInspection(
                true, "Countries", null, null, 1, CurrentFingerprint,
                CrystalReportInspectionFailure.None)
        };
        var unitOfWork = new InlineUnitOfWork();
        var handler = new RevalidateCrystalReportVersionCommandHandler(
            store,
            storage,
            inspector,
            new AllowAllPermissions(),
            new StubContracts(CurrentFingerprint, ["countries"]),
            unitOfWork,
            Errors());

        var result = await handler.Handle(
            new RevalidateCrystalReportVersionCommand(report.Id, version.Id),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Valid", result.Value.ValidationStatus);
        Assert.Equal(CurrentFingerprint, result.Value.ValidationContractFingerprint);
        Assert.Equal(1, result.Value.ValidationContractSchemaVersion);
        Assert.Equal(version.StorageKey, storage.OpenedStorageKey);
        Assert.Equal(version.Size, storage.OpenedExpectedSize);
        Assert.Equal(version.Sha256, storage.OpenedExpectedSha256);
        Assert.Equal("countries", inspector.EntityKey);
        Assert.Equal(1, unitOfWork.SaveCalls);
    }

    [Fact]
    public async Task Revalidate_PersistsDeterministicMismatchAsInvalidOutcome()
    {
        var report = CrystalReport.Create(
            "countries", "countries-directory", "Countries", null);
        var version = Version(report.Id, StaleFingerprint);
        version.MarkNeedsRevalidation();
        report.AddVersion(version);
        var unitOfWork = new InlineUnitOfWork();
        var handler = new RevalidateCrystalReportVersionCommandHandler(
            new RecordingStore
            {
                Detail = Detail(report.Id, "countries", isPublished: false),
                Aggregate = report,
                Version = version
            },
            new RecordingFileStorage { OpenBytes = new byte[128] },
            new RecordingInspector
            {
                Result = new CrystalReportInspection(
                    false, null, null, "raw runtime detail", null, null,
                    CrystalReportInspectionFailure.SchemaMismatch)
            },
            new AllowAllPermissions(),
            new StubContracts(CurrentFingerprint, ["countries"]),
            unitOfWork,
            Errors());

        var result = await handler.Handle(
            new RevalidateCrystalReportVersionCommand(report.Id, version.Id),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Invalid", result.Value.ValidationStatus);
        Assert.Equal("CrystalReportSchemaMismatch", result.Value.ValidationReason);
        Assert.Null(result.Value.ValidationContractSchemaVersion);
        Assert.Null(result.Value.ValidationContractFingerprint);
        Assert.Equal(1, unitOfWork.SaveCalls);
    }

    [Fact]
    public async Task Revalidate_TransientInspectorFailurePreservesPriorEvidence()
    {
        var report = CrystalReport.Create(
            "countries", "countries-directory", "Countries", null);
        var version = Version(report.Id, StaleFingerprint);
        report.AddVersion(version);
        var unitOfWork = new InlineUnitOfWork();
        var handler = new RevalidateCrystalReportVersionCommandHandler(
            new RecordingStore
            {
                Detail = Detail(report.Id, "countries", isPublished: false),
                Aggregate = report,
                Version = version
            },
            new RecordingFileStorage { OpenBytes = new byte[128] },
            new RecordingInspector { Result = null },
            new AllowAllPermissions(),
            new StubContracts(CurrentFingerprint, ["countries"]),
            unitOfWork,
            Errors());

        var result = await handler.Handle(
            new RevalidateCrystalReportVersionCommand(report.Id, version.Id),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.InspectorUnavailable", result.Error.Code);
        Assert.Equal(CrystalReportValidationStatus.Valid, version.ValidationStatus);
        Assert.Equal(StaleFingerprint, version.ValidationContractFingerprint);
        Assert.Equal(0, unitOfWork.SaveCalls);
    }

    [Fact]
    public async Task Revalidate_RechecksUploadAclBeforeChangingValidationState()
    {
        var report = CrystalReport.Create(
            "countries", "countries-directory", "Countries", null);
        var version = Version(report.Id, StaleFingerprint);
        version.MarkNeedsRevalidation();
        report.AddVersion(version);
        var unitOfWork = new InlineUnitOfWork();
        var handler = new RevalidateCrystalReportVersionCommandHandler(
            new RecordingStore
            {
                Detail = Detail(report.Id, "countries", isPublished: false),
                Aggregate = report,
                Version = version,
                HasRight = false
            },
            new RecordingFileStorage { OpenBytes = new byte[128] },
            new RecordingInspector
            {
                Result = new CrystalReportInspection(
                    true, null, null, null, 1, CurrentFingerprint,
                    CrystalReportInspectionFailure.None)
            },
            new DenyBypassPermissionChecker(),
            new StubContracts(CurrentFingerprint, ["countries"]),
            unitOfWork,
            Errors());

        var result = await handler.Handle(
            new RevalidateCrystalReportVersionCommand(report.Id, version.Id),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("CrystalReport.NotFound", result.Error.Code);
        Assert.Equal(CrystalReportValidationStatus.NeedsRevalidation, version.ValidationStatus);
        Assert.Equal(0, unitOfWork.SaveCalls);
    }

    private static CrystalReportVersion Version(Guid reportId, string fingerprint) =>
        CrystalReportVersion.Create(
            reportId,
            1,
            $"reports/{reportId:N}/1.rpt",
            "countries-directory.rpt",
            128,
            new string('c', 64),
            "Countries directory",
            null,
            1,
            fingerprint);

    private static CrystalReportDetailResponse Detail(
        Guid reportId,
        string entityKey,
        bool isPublished) =>
        new(
            reportId,
            entityKey,
            $"{entityKey}-directory",
            "Directory",
            null,
            isPublished ? 1 : null,
            isPublished,
            false,
            Convert.ToBase64String(new byte[8]),
            DateTime.UtcNow,
            null,
            [],
            []);

    private static FileUpload Upload(string fileName)
    {
        var bytes = "fake-rpt"u8.ToArray();
        return new FileUpload(
            fileName,
            "application/octet-stream",
            bytes.Length,
            () => new MemoryStream(bytes, writable: false));
    }

    private static CrystalReportErrors Errors() => new(new EchoLocalizer());

    private sealed class StubContracts(
        string fingerprint,
        IReadOnlyCollection<string> supportedEntities)
        : IManagedCrystalReportContractSource
    {
        public int SchemaVersion => 1;
        public string Fingerprint { get; } = fingerprint;
        public IReadOnlyCollection<ManagedCrystalReportEntityDescriptor> EntityDescriptors { get; } =
            supportedEntities.Select(entity => new ManagedCrystalReportEntityDescriptor(
                entity,
                "tenant-company",
                ["code"])).ToArray();

        public bool Supports(string entityKey) =>
            supportedEntities.Contains(entityKey, StringComparer.OrdinalIgnoreCase);
    }

    private sealed class RecordingFileStorage : ICrystalReportFileStorage
    {
        public int StoreCalls { get; private set; }
        public int OpenCalls { get; private set; }
        public string? StoredEntityKey { get; private set; }
        public string? OpenedStorageKey { get; private set; }
        public long? OpenedExpectedSize { get; private set; }
        public string? OpenedExpectedSha256 { get; private set; }
        public byte[]? OpenBytes { get; init; }
        public StoreCrystalReportFileResult StoreResult { get; init; } =
            new(null, CrystalReportFileFailure.InspectionRejected, "not configured");

        public Task<StoreCrystalReportFileResult> StoreAsync(
            string entityKey,
            FileUpload upload,
            CancellationToken cancellationToken)
        {
            StoreCalls++;
            StoredEntityKey = entityKey;
            return Task.FromResult(StoreResult);
        }

        public Task<Stream?> OpenVerifiedReadAsync(
            string storageKey,
            long expectedSize,
            string expectedSha256,
            CancellationToken cancellationToken)
        {
            OpenCalls++;
            OpenedStorageKey = storageKey;
            OpenedExpectedSize = expectedSize;
            OpenedExpectedSha256 = expectedSha256;
            return Task.FromResult<Stream?>(OpenBytes is null
                ? null
                : new MemoryStream(OpenBytes, writable: false));
        }

        public Task DeleteIfExistsAsync(
            string storageKey,
            CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class RecordingStore : ICrystalReportStore
    {
        public CrystalReportDetailResponse? Detail { get; init; }
        public CrystalReport? Aggregate { get; init; }
        public CrystalReportVersion? Version { get; init; }
        public bool HasRight { get; init; } = true;

        public Task<CrystalReportDetailResponse?> GetDetailAsync(
            Guid id,
            bool includeArchived,
            CrystalReportRight? requiredRight,
            bool bypassAcl,
            CancellationToken cancellationToken) => Task.FromResult(Detail);

        public Task<CrystalReport?> GetForUpdateAsync(
            Guid id,
            CancellationToken cancellationToken) => Task.FromResult(Aggregate);

        public Task<CrystalReportVersion?> GetVersionAsync(
            Guid reportId,
            Guid versionId,
            CancellationToken cancellationToken) => Task.FromResult(Version);

        public Task<CrystalReportVersion?> GetDownloadVersionAsync(
            Guid reportId,
            Guid? versionId,
            CancellationToken cancellationToken) => Task.FromResult(Version);

        public Task<bool> HasRightAsync(
            Guid reportId,
            CrystalReportRight right,
            CancellationToken cancellationToken) => Task.FromResult(HasRight);

        public Task<bool> ReportKeyExistsAsync(
            string entityKey,
            string reportKey,
            CancellationToken cancellationToken) => Task.FromResult(false);

        public Task<int> GetNextVersionNumberAsync(
            Guid reportId,
            CancellationToken cancellationToken) => Task.FromResult(2);

        public Task<IReadOnlyList<CrystalReportListItemResponse>> ListPublishedAsync(
            string? entityKey,
            string? search,
            CrystalReportRight requiredRight,
            bool bypassAcl,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<CrystalReportPageResponse> ListManagementAsync(
            string? entityKey,
            string? search,
            string? status,
            int page,
            int pageSize,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<IReadOnlyList<CrystalReportIdentity>> ListIdentitiesAsync(
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<IReadOnlyList<CrystalReportRoleGrantResponse>> GetGrantsAsync(
            Guid reportId,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<IReadOnlyList<CrystalReportRoleOptionResponse>> GetGrantRoleOptionsAsync(
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<bool> AreGrantRolesValidAsync(
            IReadOnlyCollection<string> roleIds,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public void Add(CrystalReport report) => throw new NotSupportedException();
        public void AddVersion(CrystalReportVersion version) => throw new NotSupportedException();

        public void ReplaceGrants(
            CrystalReport report,
            IReadOnlyCollection<CrystalReportRoleGrant> grants) => throw new NotSupportedException();

        public void ApplyOriginalRowVersion(CrystalReport report, byte[] rowVersion)
        {
        }
    }

    private sealed class InlineUnitOfWork : IUnitOfWork
    {
        public int SaveCalls { get; private set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveCalls++;
            return Task.FromResult(1);
        }

        public Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default) => operation(cancellationToken);
    }

    private sealed class AllowAllPermissions : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => true;
    }

    private sealed class DenyBypassPermissionChecker : ICurrentPermissionChecker
    {
        public bool HasPermission(string permission) => false;
    }

    private sealed class RecordingInspector : ICrystalReportInspector
    {
        public CrystalReportInspection? Result { get; init; }
        public string? EntityKey { get; private set; }

        public Task<CrystalReportInspection?> InspectAsync(
            string entityKey,
            FileUpload upload,
            CancellationToken cancellationToken)
        {
            EntityKey = entityKey;
            return Task.FromResult(Result);
        }
    }

    private sealed class RecordingDataSource : ICrystalReportDataSource
    {
        public int BuildCalls { get; private set; }

        public Task<CrystalReportDataBuildResult> BuildAsync(
            string entityKey,
            IReadOnlyDictionary<string, string?> filters,
            CancellationToken cancellationToken)
        {
            BuildCalls++;
            return Task.FromResult(new CrystalReportDataBuildResult(
                new CrystalReportDataSet("<ReportData />"),
                CrystalReportDataFailure.None));
        }
    }

    private sealed class RecordingRenderer : ICrystalReportRenderer
    {
        public int RenderCalls { get; private set; }

        public Task<CrystalReportRenderResult> RenderAsync(
            CrystalReportRuntimeRequest request,
            CancellationToken cancellationToken)
        {
            RenderCalls++;
            return Task.FromResult(new CrystalReportRenderResult(
                null,
                CrystalReportRenderFailure.RuntimeUnavailable));
        }
    }

    private sealed class EchoLocalizer : IStringLocalizer<CrystalReportDetailResponse>
    {
        public LocalizedString this[string name] => new(name, name);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(CultureInfo.InvariantCulture, name, arguments));

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
