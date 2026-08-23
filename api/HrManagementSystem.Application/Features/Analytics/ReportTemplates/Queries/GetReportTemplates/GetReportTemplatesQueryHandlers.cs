using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplates;

public sealed class GetPublishedReportTemplatesQueryHandler(IReportTemplateStore store)
    : IQueryHandler<GetPublishedReportTemplatesQuery, IReadOnlyList<ReportTemplateListItemResponse>>
{
    public Task<IReadOnlyList<ReportTemplateListItemResponse>> Handle(
        GetPublishedReportTemplatesQuery request,
        CancellationToken cancellationToken) =>
        store.ListAsync(request.FeatureKey, "active", publishedOnly: true, cancellationToken);
}

public sealed class GetReportTemplatesManagementQueryHandler(IReportTemplateStore store)
    : IQueryHandler<GetReportTemplatesManagementQuery, IReadOnlyList<ReportTemplateListItemResponse>>
{
    public Task<IReadOnlyList<ReportTemplateListItemResponse>> Handle(
        GetReportTemplatesManagementQuery request,
        CancellationToken cancellationToken) =>
        store.ListAsync(request.FeatureKey, request.Status, publishedOnly: false, cancellationToken);
}
