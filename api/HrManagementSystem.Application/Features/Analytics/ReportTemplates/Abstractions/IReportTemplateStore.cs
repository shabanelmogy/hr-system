using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;

public interface IReportTemplateStore
{
    Task<IReadOnlyList<ReportTemplateListItemResponse>> ListAsync(
        string featureKey,
        string status,
        bool publishedOnly,
        CancellationToken cancellationToken);

    Task<ReportTemplateDetailResponse?> GetAsync(
        Guid id,
        bool publishedOnly,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ReportTemplateRevisionResponse>> ListRevisionsAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<ReportTemplateRevisionResponse?> GetRevisionAsync(
        Guid id,
        int revisionNumber,
        CancellationToken cancellationToken);

    Task<ReportTemplate?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> NameExistsAsync(
        string featureKey,
        string name,
        Guid? excludedId,
        CancellationToken cancellationToken);
    void Add(ReportTemplate template);
    void ApplyOriginalRowVersion(ReportTemplate template, byte[] rowVersion);
}
