using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

public enum CrystalReportValidationStatus
{
    Pending = 0,
    Valid = 1,
    Invalid = 2,
    NeedsRevalidation = 3
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
    public int? ValidationContractSchemaVersion { get; private set; }
    public string? ValidationContractFingerprint { get; private set; }
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
        int validationContractSchemaVersion,
        string validationContractFingerprint)
    {
        if (reportId == Guid.Empty)
            throw new ArgumentException("A Crystal report identifier is required.", nameof(reportId));
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(versionNumber);
        if (string.IsNullOrWhiteSpace(storageKey))
            throw new ArgumentException("A Crystal report storage key is required.", nameof(storageKey));
        if (string.IsNullOrWhiteSpace(originalFileName))
            throw new ArgumentException("A Crystal report file name is required.", nameof(originalFileName));
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(size);
        if (sha256 is not { Length: 64 } || !sha256.All(IsLowerHexCharacter))
            throw new ArgumentException("A lowercase SHA-256 hash is required.", nameof(sha256));
        ValidateContractEvidence(validationContractSchemaVersion, validationContractFingerprint);

        return new()
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
            ValidationStatus = CrystalReportValidationStatus.Valid,
            ValidationReason = null,
            ValidationContractSchemaVersion = validationContractSchemaVersion,
            ValidationContractFingerprint = validationContractFingerprint
        };
    }

    public bool IsValidFor(string contractFingerprint) =>
        ValidationStatus == CrystalReportValidationStatus.Valid &&
        ValidationContractSchemaVersion is > 0 &&
        IsLowerSha256(contractFingerprint) &&
        string.Equals(
            ValidationContractFingerprint,
            contractFingerprint,
            StringComparison.Ordinal);

    public void MarkValid(int contractSchemaVersion, string contractFingerprint)
    {
        ValidateContractEvidence(contractSchemaVersion, contractFingerprint);
        ValidationStatus = CrystalReportValidationStatus.Valid;
        ValidationReason = null;
        ValidationContractSchemaVersion = contractSchemaVersion;
        ValidationContractFingerprint = contractFingerprint;
    }

    public void MarkInvalid(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("A validation failure reason is required.", nameof(reason));
        if (reason.Trim().Length > 500)
            throw new ArgumentException("A validation failure reason cannot exceed 500 characters.", nameof(reason));

        ValidationStatus = CrystalReportValidationStatus.Invalid;
        ValidationReason = NormalizeOptional(reason);
        ValidationContractSchemaVersion = null;
        ValidationContractFingerprint = null;
    }

    public void MarkNeedsRevalidation(string? reason = null)
    {
        if (reason?.Trim().Length > 500)
            throw new ArgumentException("A validation reason cannot exceed 500 characters.", nameof(reason));
        ValidationStatus = CrystalReportValidationStatus.NeedsRevalidation;
        ValidationReason = NormalizeOptional(reason);
        ValidationContractSchemaVersion = null;
        ValidationContractFingerprint = null;
    }

    private static void ValidateContractEvidence(int schemaVersion, string fingerprint)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(schemaVersion);
        if (!IsLowerSha256(fingerprint))
            throw new ArgumentException(
                "A lowercase managed Crystal contract SHA-256 fingerprint is required.",
                nameof(fingerprint));
    }

    private static bool IsLowerSha256(string? value) =>
        value is { Length: 64 } && value.All(IsLowerHexCharacter);

    private static bool IsLowerHexCharacter(char value) =>
        value is >= '0' and <= '9' or >= 'a' and <= 'f';

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
