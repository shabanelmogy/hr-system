using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Errors;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateById;

public sealed class GetPublishedReportTemplateByIdQueryHandler(
    IReportTemplateStore store,
    ReportTemplateErrors errors)
    : IQueryHandler<GetPublishedReportTemplateByIdQuery, Result<ReportTemplateDetailResponse>>
{
    public async Task<Result<ReportTemplateDetailResponse>> Handle(
        GetPublishedReportTemplateByIdQuery request,
        CancellationToken cancellationToken)
    {
        var response = await store.GetAsync(request.Id, publishedOnly: true, cancellationToken);
        return response is null
            ? Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateNotFound)
            : Result.Success(response);
    }
}

public sealed class GetReportTemplateForManagementQueryHandler(
    IReportTemplateStore store,
    ReportTemplateErrors errors)
    : IQueryHandler<GetReportTemplateForManagementQuery, Result<ReportTemplateDetailResponse>>
{
    public async Task<Result<ReportTemplateDetailResponse>> Handle(
        GetReportTemplateForManagementQuery request,
        CancellationToken cancellationToken)
    {
        var response = await store.GetAsync(request.Id, publishedOnly: false, cancellationToken);
        return response is null
            ? Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateNotFound)
            : Result.Success(response);
    }
}
