namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;

public sealed record CrystalReportListItemResponse(
    Guid Id,
    string EntityKey,
    string ReportKey,
    string DisplayName,
    string? SummaryTitle,
    string? SummarySubject,
    string? Description,
    int? CurrentVersionNumber,
    bool IsPublished,
    bool IsArchived,
    string RowVersion,
    DateTime? UpdatedOn);

public sealed record CrystalReportPageResponse(
    IReadOnlyList<CrystalReportListItemResponse> Items,
    int TotalCount);

public sealed record CrystalReportVersionResponse(
    Guid Id,
    int VersionNumber,
    string OriginalFileName,
    long Size,
    string Sha256,
    string? SummaryTitle,
    string? SummarySubject,
    string ValidationStatus,
    string? ValidationReason,
    bool IsPublished,
    DateTime CreatedOn);

public sealed record CrystalReportRoleGrantResponse(
    string RoleId,
    string RoleName,
    IReadOnlyList<string> Rights);

public sealed record CrystalReportDetailResponse(
    Guid Id,
    string EntityKey,
    string ReportKey,
    string DisplayName,
    string? Description,
    int? CurrentVersionNumber,
    bool IsPublished,
    bool IsArchived,
    string RowVersion,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    IReadOnlyList<CrystalReportVersionResponse> Versions,
    IReadOnlyList<CrystalReportRoleGrantResponse> Access);

public sealed record CrystalReportGrantRequest(
    string RoleId,
    IReadOnlyCollection<string> Rights);

public sealed record ReplaceCrystalReportGrantsRequest(
    string RowVersion,
    IReadOnlyCollection<CrystalReportGrantRequest> Grants);

public sealed record CrystalReportConcurrencyRequest(string RowVersion);

public sealed record CrystalReportDownload(
    Stream Content,
    string FileName,
    string ContentType,
    long Length);

public sealed record CrystalReportRenderRequest(
    string Language,
    IReadOnlyDictionary<string, string?>? Filters);

public sealed record CrystalReportRuntimeRequest(
    string EntityKey,
    string ReportKey,
    string OriginalFileName,
    long Length,
    Stream Content,
    string Language,
    string DataXml);

public sealed record CrystalReportDataSet(string Xml);

public enum CrystalReportRenderFailure
{
    None,
    UnsupportedEntity,
    RuntimeUnavailable
}

public sealed record CrystalReportRenderResult(
    CrystalReportDownload? Report,
    CrystalReportRenderFailure Failure)
{
    public bool IsSuccess => Report is not null && Failure == CrystalReportRenderFailure.None;
}

public sealed record StoredCrystalReportFile(
    string StorageKey,
    string OriginalFileName,
    long Size,
    string Sha256,
    string? SummaryTitle,
    string? SummarySubject);

public enum CrystalReportFileFailure
{
    None,
    InvalidExtension,
    TooLarge,
    InvalidSignature,
    InspectionUnavailable,
    InspectionRejected
}

public sealed record StoreCrystalReportFileResult(
    StoredCrystalReportFile? File,
    CrystalReportFileFailure Failure,
    string? FailureReason)
{
    public bool IsSuccess => File is not null && Failure == CrystalReportFileFailure.None;
}

public sealed record CrystalReportInspection(
    bool IsValid,
    string? SummaryTitle,
    string? SummarySubject,
    string? ValidationReason);

public sealed record LegacyCrystalReportDescriptor(
    string SourceId,
    string EntityKey,
    string ReportKey,
    string FileName,
    string DisplayName,
    string? Subject,
    long Size,
    string Sha256,
    DateTime LastModifiedUtc,
    bool IsImportable,
    string? ValidationReason);

public sealed record DiscoveredCrystalReportResponse(
    string SourceId,
    string EntityKey,
    string ReportKey,
    string FileName,
    string DisplayName,
    string? Subject,
    long Size,
    string Sha256,
    DateTime LastModifiedUtc,
    bool IsImportable,
    string? ValidationReason,
    bool IsImported);

public sealed record CrystalReportIdentity(string EntityKey, string ReportKey);

public sealed record ImportDiscoveredCrystalReportRequest(
    string SourceId,
    string ExpectedSha256,
    string? Description);
