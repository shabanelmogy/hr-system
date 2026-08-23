using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

public sealed class ReportTemplateRevision : TenantAuditableEntity
{
    private ReportTemplateRevision()
    {
    }

    public Guid Id { get; private set; }
    public Guid ReportTemplateId { get; private set; }
    public int RevisionNumber { get; private set; }
    public string Operation { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string DataSourceKey { get; private set; } = string.Empty;
    public string DefinitionJson { get; private set; } = string.Empty;
    public string ContentHash { get; private set; } = string.Empty;
    public bool IsPublished { get; private set; }
    public bool IsArchived { get; private set; }
    public ReportTemplate ReportTemplate { get; private set; } = null!;

    internal static ReportTemplateRevision CreateSnapshot(
        ReportTemplate template,
        string operation) =>
        new()
        {
            ReportTemplateId = template.Id,
            RevisionNumber = template.RevisionNumber,
            Operation = operation,
            Name = template.Name,
            Description = template.Description,
            DataSourceKey = template.DataSourceKey,
            DefinitionJson = template.DefinitionJson,
            ContentHash = template.ContentHash,
            IsPublished = template.IsPublished,
            IsArchived = template.IsDeleted
        };
}
