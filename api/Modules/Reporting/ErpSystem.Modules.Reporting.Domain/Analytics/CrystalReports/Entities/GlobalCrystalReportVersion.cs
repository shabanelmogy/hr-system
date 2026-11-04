using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

/// <summary>Immutable source identity; revalidation changes evidence only.</summary>
public sealed class GlobalCrystalReportVersion : AuditableEntity
{
    private GlobalCrystalReportVersion() { }

    public Guid Id { get; private set; }
    public Guid GlobalCrystalReportId { get; private set; }
    public int VersionNumber { get; private set; }
    public string StorageKey { get; private set; } = string.Empty;
    public string OriginalFileName { get; private set; } = string.Empty;
    public long Size { get; private set; }
    public string Sha256 { get; private set; } = string.Empty;
    public string? SummaryTitle { get; private set; }
    public string? SummarySubject { get; private set; }
    public CrystalReportValidationStatus ValidationStatus { get; private set; }
    public string? ValidationReason { get; private set; }
    public int? ValidationContractSchemaVersion { get; private set; }
    public string? ValidationContractFingerprint { get; private set; }
    public GlobalCrystalReport Report { get; private set; } = null!;

    public static GlobalCrystalReportVersion Create(Guid reportId, int number, string storageKey,
        string fileName, long size, string sha256, string? title, string? subject,
        int schemaVersion, string fingerprint)
    {
        // One existing source/evidence validator serves both ownership models.
        var validated = CrystalReportVersion.Create(reportId, number, storageKey, fileName,
            size, sha256, title, subject, schemaVersion, fingerprint);
        return new GlobalCrystalReportVersion
        {
            Id = validated.Id, GlobalCrystalReportId = reportId, VersionNumber = number,
            StorageKey = validated.StorageKey, OriginalFileName = validated.OriginalFileName,
            Size = validated.Size, Sha256 = validated.Sha256, SummaryTitle = validated.SummaryTitle,
            SummarySubject = validated.SummarySubject, ValidationStatus = validated.ValidationStatus,
            ValidationContractSchemaVersion = schemaVersion, ValidationContractFingerprint = fingerprint
        };
    }

    public bool IsValidFor(string fingerprint) =>
        ValidationStatus == CrystalReportValidationStatus.Valid && ValidationContractSchemaVersion > 0 &&
        string.Equals(ValidationContractFingerprint, fingerprint, StringComparison.Ordinal);

    public void RecordValidation(bool valid, string? reason, int schemaVersion, string fingerprint)
    {
        if (valid)
        {
            var evidence = CrystalReportVersion.Create(GlobalCrystalReportId, VersionNumber,
                StorageKey, OriginalFileName, Size, Sha256, SummaryTitle, SummarySubject,
                schemaVersion, fingerprint);
            ValidationStatus = evidence.ValidationStatus;
            ValidationReason = null;
            ValidationContractSchemaVersion = schemaVersion;
            ValidationContractFingerprint = fingerprint;
            return;
        }
        if (string.IsNullOrWhiteSpace(reason) || reason.Length > 500)
            throw new ArgumentException("A bounded validation reason is required.", nameof(reason));
        ValidationStatus = CrystalReportValidationStatus.Invalid;
        ValidationReason = reason;
        ValidationContractSchemaVersion = null;
        ValidationContractFingerprint = null;
    }
}
