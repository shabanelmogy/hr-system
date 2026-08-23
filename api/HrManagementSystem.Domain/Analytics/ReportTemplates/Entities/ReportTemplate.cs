using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

public sealed class ReportTemplate : TenantAuditableEntity
{
    private ReportTemplate()
    {
    }

    public Guid Id { get; private set; }
    public string FeatureKey { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string DataSourceKey { get; private set; } = string.Empty;
    public string DefinitionJson { get; private set; } = string.Empty;
    public string ContentHash { get; private set; } = string.Empty;
    public int RevisionNumber { get; private set; }
    public bool IsPublished { get; private set; }
    public ICollection<ReportTemplateRevision> Revisions { get; private set; } = [];

    public static ReportTemplate Create(
        string featureKey,
        string name,
        string? description,
        string dataSourceKey,
        string definitionJson,
        string contentHash)
    {
        var template = new ReportTemplate
        {
            Id = Guid.NewGuid(),
            FeatureKey = NormalizeKey(featureKey),
            Name = name.Trim(),
            Description = NormalizeOptional(description),
            DataSourceKey = NormalizeKey(dataSourceKey),
            DefinitionJson = definitionJson,
            ContentHash = contentHash,
            RevisionNumber = 1
        };
        template.AddRevision("Create");
        return template;
    }

    public void Update(
        string name,
        string? description,
        string dataSourceKey,
        string definitionJson,
        string contentHash)
    {
        Name = name.Trim();
        Description = NormalizeOptional(description);
        DataSourceKey = NormalizeKey(dataSourceKey);
        DefinitionJson = definitionJson;
        ContentHash = contentHash;
        RevisionNumber++;
        AddRevision("Update");
    }

    public void Publish()
    {
        if (IsPublished)
            return;

        IsPublished = true;
        RevisionNumber++;
        AddRevision("Publish");
    }

    public void Unpublish()
    {
        if (!IsPublished)
            return;

        IsPublished = false;
        RevisionNumber++;
        AddRevision("Unpublish");
    }

    public void RecordLifecycleRevision(string operation)
    {
        RevisionNumber++;
        AddRevision(operation);
    }

    private void AddRevision(string operation) => Revisions.Add(
        ReportTemplateRevision.CreateSnapshot(this, operation));

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
