using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

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
        => new()
        {
            Id = Guid.NewGuid(),
            EntityKey = NormalizeKey(entityKey),
            ReportKey = NormalizeKey(reportKey),
            DisplayName = displayName.Trim(),
            Description = NormalizeOptional(description)
        };

    public void AddVersion(CrystalReportVersion version) => Versions.Add(version);

    public void Publish(Guid versionId, string? summaryTitle, string originalFileName)
    {
        CurrentPublishedVersionId = versionId;
        DisplayName = string.IsNullOrWhiteSpace(summaryTitle)
            ? Path.GetFileNameWithoutExtension(originalFileName).Trim()
            : summaryTitle.Trim();
    }

    public void Archive() => IsDeleted = true;

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();
    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
