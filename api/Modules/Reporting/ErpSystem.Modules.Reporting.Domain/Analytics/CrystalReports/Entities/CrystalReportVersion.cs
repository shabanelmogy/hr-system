using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

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
            ValidationStatus = validationStatus,
            ValidationReason = NormalizeOptional(validationReason)
        };
    }

    private static bool IsLowerHexCharacter(char value) =>
        value is >= '0' and <= '9' or >= 'a' and <= 'f';

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
