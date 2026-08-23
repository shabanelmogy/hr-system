using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateRevisions;

public sealed class GetReportTemplateRevisionsQueryHandler(
    IReportTemplateStore store,
    ReportTemplateErrors errors)
    : IQueryHandler<GetReportTemplateRevisionsQuery, Result<IReadOnlyList<ReportTemplateRevisionResponse>>>
{
    public async Task<Result<IReadOnlyList<ReportTemplateRevisionResponse>>> Handle(
        GetReportTemplateRevisionsQuery request,
        CancellationToken cancellationToken)
    {
        if (await store.GetAsync(request.Id, publishedOnly: false, cancellationToken) is null)
            return Result.Failure<IReadOnlyList<ReportTemplateRevisionResponse>>(errors.ReportTemplateNotFound);

        return Result.Success(await store.ListRevisionsAsync(request.Id, cancellationToken));
    }
}

public sealed class GetReportTemplateRevisionQueryHandler(
    IReportTemplateStore store,
    ReportTemplateErrors errors)
    : IQueryHandler<GetReportTemplateRevisionQuery, Result<ReportTemplateRevisionResponse>>
{
    public async Task<Result<ReportTemplateRevisionResponse>> Handle(
        GetReportTemplateRevisionQuery request,
        CancellationToken cancellationToken)
    {
        var revision = await store.GetRevisionAsync(
            request.Id,
            request.RevisionNumber,
            cancellationToken);
        return revision is null
            ? Result.Failure<ReportTemplateRevisionResponse>(errors.ReportTemplateRevisionNotFound)
            : Result.Success(revision);
    }
}
