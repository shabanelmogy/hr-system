using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateById;

public sealed record GetPublishedReportTemplateByIdQuery(Guid Id)
    : IQuery<Result<ReportTemplateDetailResponse>>;

public sealed record GetReportTemplateForManagementQuery(Guid Id)
    : IQuery<Result<ReportTemplateDetailResponse>>;

public sealed class GetPublishedReportTemplateByIdQueryValidator
    : AbstractValidator<GetPublishedReportTemplateByIdQuery>
{
    public GetPublishedReportTemplateByIdQueryValidator() => RuleFor(query => query.Id).NotEmpty();
}

public sealed class GetReportTemplateForManagementQueryValidator
    : AbstractValidator<GetReportTemplateForManagementQuery>
{
    public GetReportTemplateForManagementQueryValidator() => RuleFor(query => query.Id).NotEmpty();
}
