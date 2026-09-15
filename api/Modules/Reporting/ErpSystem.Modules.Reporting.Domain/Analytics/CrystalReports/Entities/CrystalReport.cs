using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

public sealed class CrystalReport : TenantAuditableEntity
{
    private CrystalReport() { }

    public Guid Id { get; private set; }
    public string EntityKey { get; private set; } = string.Empty;
    public string ReportKey { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? CurrentPublishedVersionId { get; private set; }
    public ICollection<CrystalReportVersion> Versions { get; private set; } = [];
    public ICollection<CrystalReportRoleGrant> RoleGrants { get; private set; } = [];

    public static CrystalReport Create(
        string entityKey,
        string reportKey,
        string displayName,
        string? description)
    {
        var normalizedEntityKey = NormalizeKey(entityKey, 64);
        var normalizedReportKey = NormalizeKey(reportKey, 128);
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ArgumentException("A Crystal report display name is required.", nameof(displayName));

        return new()
        {
            Id = Guid.NewGuid(),
            EntityKey = normalizedEntityKey,
            ReportKey = normalizedReportKey,
            DisplayName = displayName.Trim(),
            Description = NormalizeOptional(description)
        };
    }

    public void AddVersion(CrystalReportVersion version)
    {
        ArgumentNullException.ThrowIfNull(version);
        EnsureActive();
        if (version.CrystalReportId != Id)
            throw new InvalidOperationException("A Crystal report version must belong to the report aggregate.");
        Versions.Add(version);
    }

    public void Publish(CrystalReportVersion version)
    {
        ArgumentNullException.ThrowIfNull(version);
        EnsureActive();
        if (version.CrystalReportId != Id)
            throw new InvalidOperationException("Only a version owned by this Crystal report can be published.");
        if (version.ValidationStatus != CrystalReportValidationStatus.Valid)
            throw new InvalidOperationException("Only a validated Crystal report version can be published.");

        CurrentPublishedVersionId = version.Id;
        DisplayName = string.IsNullOrWhiteSpace(version.SummaryTitle)
            ? Path.GetFileNameWithoutExtension(version.OriginalFileName).Trim()
            : version.SummaryTitle.Trim();
    }

    public void Archive() => IsDeleted = true;

    private void EnsureActive()
    {
        if (IsDeleted)
            throw new InvalidOperationException("Archived Crystal reports cannot be changed.");
    }

    private static string NormalizeKey(string value, int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("A Crystal report key is required.", nameof(value));

        var normalized = value.Trim().ToLowerInvariant();
        if (normalized.Length > maximumLength ||
            normalized[0] == '-' || normalized[^1] == '-' ||
            normalized.Contains("--", StringComparison.Ordinal) ||
            normalized.Any(character =>
                character != '-' &&
                (character < 'a' || character > 'z') &&
                (character < '0' || character > '9')))
        {
            throw new ArgumentException(
                "Crystal report keys may contain only letters, numbers, and single hyphens.",
                nameof(value));
        }

        return normalized;
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
