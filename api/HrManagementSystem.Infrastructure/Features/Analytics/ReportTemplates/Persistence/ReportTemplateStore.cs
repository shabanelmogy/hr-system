using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

namespace HrManagementSystem.Infrastructure.Features.Analytics.ReportTemplates.Persistence;

public sealed class ReportTemplateStore(ApplicationDbContext context) : IReportTemplateStore
{
    public async Task<IReadOnlyList<ReportTemplateListItemResponse>> ListAsync(
        string featureKey,
        string status,
        bool publishedOnly,
        CancellationToken cancellationToken)
    {
        var normalizedFeatureKey = featureKey.Trim().ToLowerInvariant();
        var query = context.ReportTemplates.AsNoTracking()
            .Where(template => template.FeatureKey == normalizedFeatureKey);
        query = status.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(template => template.IsDeleted),
            "ALL" => query,
            _ => query.Where(template => !template.IsDeleted)
        };
        if (publishedOnly)
            query = query.Where(template => template.IsPublished && !template.IsDeleted);

        return await query
            .OrderBy(template => template.Name)
            .ThenBy(template => template.Id)
            .Select(template => new ReportTemplateListItemResponse(
                template.Id,
                template.FeatureKey,
                template.Name,
                template.Description,
                template.DataSourceKey,
                template.RevisionNumber,
                template.IsPublished,
                template.IsDeleted,
                template.CreatedOn,
                template.UpdatedOn,
                Convert.ToBase64String(template.RowVersion)))
            .ToListAsync(cancellationToken);
    }

    public Task<ReportTemplateDetailResponse?> GetAsync(
        Guid id,
        bool publishedOnly,
        CancellationToken cancellationToken) =>
        context.ReportTemplates.AsNoTracking()
            .Where(template => template.Id == id &&
                (!publishedOnly || template.IsPublished && !template.IsDeleted))
            .Select(template => new ReportTemplateDetailResponse(
                template.Id,
                template.FeatureKey,
                template.Name,
                template.Description,
                template.DataSourceKey,
                template.DefinitionJson,
                template.ContentHash,
                template.RevisionNumber,
                template.IsPublished,
                template.IsDeleted,
                template.CreatedOn,
                template.UpdatedOn,
                Convert.ToBase64String(template.RowVersion)))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<ReportTemplateRevisionResponse>> ListRevisionsAsync(
        Guid id,
        CancellationToken cancellationToken) =>
        await context.ReportTemplateRevisions.AsNoTracking()
            .Where(revision => revision.ReportTemplateId == id)
            .OrderByDescending(revision => revision.RevisionNumber)
            .Select(revision => ToResponse(revision))
            .ToListAsync(cancellationToken);

    public Task<ReportTemplateRevisionResponse?> GetRevisionAsync(
        Guid id,
        int revisionNumber,
        CancellationToken cancellationToken) =>
        context.ReportTemplateRevisions.AsNoTracking()
            .Where(revision =>
                revision.ReportTemplateId == id &&
                revision.RevisionNumber == revisionNumber)
            .Select(revision => ToResponse(revision))
            .FirstOrDefaultAsync(cancellationToken);

    public Task<ReportTemplate?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken) =>
        context.ReportTemplates
            .FirstOrDefaultAsync(template => template.Id == id, cancellationToken);

    public Task<bool> NameExistsAsync(
        string featureKey,
        string name,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedFeatureKey = featureKey.Trim().ToLowerInvariant();
        var normalizedName = name.Trim();
        return context.ReportTemplates.AnyAsync(
            template =>
                template.FeatureKey == normalizedFeatureKey &&
                template.Name == normalizedName &&
                (!excludedId.HasValue || template.Id != excludedId.Value),
            cancellationToken);
    }

    public void Add(ReportTemplate template) => context.ReportTemplates.Add(template);

    public void ApplyOriginalRowVersion(ReportTemplate template, byte[] rowVersion) =>
        context.Entry(template).Property(candidate => candidate.RowVersion).OriginalValue = rowVersion;

    private static ReportTemplateRevisionResponse ToResponse(ReportTemplateRevision revision) =>
        new(
            revision.Id,
            revision.ReportTemplateId,
            revision.RevisionNumber,
            revision.Operation,
            revision.Name,
            revision.Description,
            revision.DataSourceKey,
            revision.DefinitionJson,
            revision.ContentHash,
            revision.IsPublished,
            revision.IsArchived,
            revision.CreatedOn);
}
