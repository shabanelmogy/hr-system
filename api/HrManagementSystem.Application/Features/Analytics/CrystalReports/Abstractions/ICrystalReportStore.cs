using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;

public interface ICrystalReportStore
{
    Task<IReadOnlyList<CrystalReportListItemResponse>> ListPublishedAsync(
        string? entityKey, string? search, CrystalReportRight requiredRight,
        bool bypassAcl, CancellationToken cancellationToken);
    Task<CrystalReportPageResponse> ListManagementAsync(
        string? entityKey, string? search, string? status, int page, int pageSize,
        CancellationToken cancellationToken);
    Task<CrystalReportDetailResponse?> GetDetailAsync(
        Guid id, bool includeArchived, CrystalReportRight? requiredRight,
        bool bypassAcl, CancellationToken cancellationToken);
    Task<CrystalReport?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken);
    Task<CrystalReportVersion?> GetVersionAsync(
        Guid reportId, Guid versionId, CancellationToken cancellationToken);
    Task<int> GetNextVersionNumberAsync(Guid reportId, CancellationToken cancellationToken);
    Task<bool> ReportKeyExistsAsync(
        string entityKey, string reportKey, CancellationToken cancellationToken);
    Task<IReadOnlyList<CrystalReportIdentity>> ListIdentitiesAsync(
        CancellationToken cancellationToken);
    Task<bool> HasRightAsync(
        Guid reportId, CrystalReportRight right, CancellationToken cancellationToken);
    Task<IReadOnlyList<CrystalReportRoleGrantResponse>> GetGrantsAsync(
        Guid reportId, CancellationToken cancellationToken);
    Task<bool> AreGrantRolesValidAsync(
        IReadOnlyCollection<string> roleIds, CancellationToken cancellationToken);
    Task<CrystalReportVersion?> GetDownloadVersionAsync(
        Guid reportId, Guid? versionId, CancellationToken cancellationToken);
    void Add(CrystalReport report);
    void AddVersion(CrystalReportVersion version);
    void ReplaceGrants(CrystalReport report, IReadOnlyCollection<CrystalReportRoleGrant> grants);
    void ApplyOriginalRowVersion(CrystalReport report, byte[] rowVersion);
}

public interface ICrystalReportFileStorage
{
    Task<StoreCrystalReportFileResult> StoreAsync(
        FileUpload upload, CancellationToken cancellationToken);
    Task<Stream?> OpenReadAsync(string storageKey, CancellationToken cancellationToken);
    Task DeleteIfExistsAsync(string storageKey, CancellationToken cancellationToken);
}

public interface ICrystalReportInspector
{
    Task<CrystalReportInspection?> InspectAsync(
        FileUpload upload, CancellationToken cancellationToken);
}

public interface ICrystalReportRenderer
{
    Task<CrystalReportRenderResult> RenderAsync(
        CrystalReportRuntimeRequest request, CancellationToken cancellationToken);
}

public interface ICrystalReportDataSource
{
    Task<CrystalReportDataSet?> BuildAsync(
        string entityKey,
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken);
}

public interface ICrystalReportLegacySource
{
    Task<IReadOnlyList<LegacyCrystalReportDescriptor>?> ListAsync(
        string? entityKey, CancellationToken cancellationToken);
    Task<FileUpload?> DownloadAsync(
        string sourceId, string expectedSha256, CancellationToken cancellationToken);
}

public interface ICurrentPermissionChecker
{
    bool HasPermission(string permission);
}
