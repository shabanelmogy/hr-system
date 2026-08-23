using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

public enum CrystalReportValidationStatus
{
    Valid = 1,
    Invalid = 2
}

public sealed class CrystalReportVersion : TenantAuditableEntity
{
    private CrystalReportVersion() { }

    public Guid Id { get; private set; }
    public Guid CrystalReportId { get; private set; }
    public int VersionNumber { get; private set; }
    public string StorageKey { get; private set; } = string.Empty;
    public string OriginalFileName { get; private set; } = string.Empty;
    public long Size { get; private set; }
    public string Sha256 { get; private set; } = string.Empty;
    public string? SummaryTitle { get; private set; }
    public string? SummarySubject { get; private set; }
    public CrystalReportValidationStatus ValidationStatus { get; private set; }
    public string? ValidationReason { get; private set; }
    public CrystalReport CrystalReport { get; private set; } = null!;

    public static CrystalReportVersion Create(
        Guid reportId,
        int versionNumber,
        string storageKey,
        string originalFileName,
        long size,
        string sha256,
        string? summaryTitle,
        string? summarySubject,
        CrystalReportValidationStatus validationStatus,
        string? validationReason)
        => new()
        {
            Id = Guid.NewGuid(),
            CrystalReportId = reportId,
            VersionNumber = versionNumber,
            StorageKey = storageKey,
            OriginalFileName = originalFileName,
            Size = size,
            Sha256 = sha256,
            SummaryTitle = NormalizeOptional(summaryTitle),
            SummarySubject = NormalizeOptional(summarySubject),
            ValidationStatus = validationStatus,
            ValidationReason = NormalizeOptional(validationReason)
        };

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
