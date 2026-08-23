using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateById;

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
