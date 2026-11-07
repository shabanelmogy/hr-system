using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

/// <summary>Platform-owned template with explicit role grants for company consumption.</summary>
public sealed class GlobalCrystalReport : AuditableEntity
{
    private GlobalCrystalReport() { }

    public Guid Id { get; private set; }
    public string EntityKey { get; private set; } = string.Empty;
    public string ReportKey { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ViewName { get; private set; }
    public string? ViewFingerprint { get; private set; }
    public Guid? CurrentPublishedVersionId { get; private set; }
    public ICollection<GlobalCrystalReportVersion> Versions { get; private set; } = [];
    public ICollection<GlobalCrystalReportRoleGrant> RoleGrants { get; private set; } = [];
    public void Archive() => IsDeleted = true;

    public static GlobalCrystalReport Create(string entityKey, string reportKey, string? description)
    {
        // Reuse the managed identity rules; global scope is deliberately not a tenant identifier.
        var identity = CrystalReport.Create(entityKey, reportKey, reportKey, description);
        if (identity.EntityKey is not ("countries" or "states" or "districts" or "system-error-logs"))
            throw new ArgumentException("Only approved global report entities are supported.", nameof(entityKey));
        if (identity.ReportKey != identity.EntityKey &&
            !identity.ReportKey.StartsWith(identity.EntityKey + "-", StringComparison.Ordinal))
            throw new ArgumentException("The report key must begin with its entity key.", nameof(reportKey));
        if (description?.Trim().Length > 500)
            throw new ArgumentException("The description cannot exceed 500 characters.", nameof(description));
        return new GlobalCrystalReport
        {
            Id = Guid.NewGuid(), EntityKey = identity.EntityKey, ReportKey = identity.ReportKey,
            DisplayName = identity.DisplayName, Description = identity.Description
        };
    }

    public static GlobalCrystalReport CreateDraft(string entityKey, string reportKey, string displayName, string? description,
        string? viewName = null, string? viewFingerprint = null)
    {
        if (string.IsNullOrWhiteSpace(displayName) || displayName.Trim().Length > 200)
            throw new ArgumentException("A report name of at most 200 characters is required.", nameof(displayName));
        var report = Create(entityKey, reportKey, description);
        report.DisplayName = displayName.Trim();
        if ((viewName is null) != (viewFingerprint is null) ||
            viewName is not null && (string.IsNullOrWhiteSpace(viewName) || viewName.Length > 257 || viewFingerprint?.Length != 64))
            throw new ArgumentException("A verified View identity and fingerprint are required.", nameof(viewName));
        report.ViewName = viewName;
        report.ViewFingerprint = viewFingerprint;
        return report;
    }

    public void AddVersion(GlobalCrystalReportVersion version)
    {
        ArgumentNullException.ThrowIfNull(version);
        if (IsDeleted || version.GlobalCrystalReportId != Id)
            throw new InvalidOperationException("The version must belong to this active global report.");
        Versions.Add(version);
    }

    public void Publish(GlobalCrystalReportVersion version, string fingerprint)
    {
        ArgumentNullException.ThrowIfNull(version);
        if (IsDeleted || version.GlobalCrystalReportId != Id || !version.IsValidFor(fingerprint))
            throw new InvalidOperationException("Only a current-contract valid version of this active report may be published.");
        CurrentPublishedVersionId = version.Id;
        DisplayName = version.SummaryTitle ?? Path.GetFileNameWithoutExtension(version.OriginalFileName);
    }
}
