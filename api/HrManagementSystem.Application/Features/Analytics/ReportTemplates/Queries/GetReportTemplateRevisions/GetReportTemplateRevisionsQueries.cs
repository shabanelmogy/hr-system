using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateRevisions;

public sealed record GetReportTemplateRevisionsQuery(Guid Id)
    : IQuery<Result<IReadOnlyList<ReportTemplateRevisionResponse>>>;

public sealed record GetReportTemplateRevisionQuery(Guid Id, int RevisionNumber)
    : IQuery<Result<ReportTemplateRevisionResponse>>;

public sealed class GetReportTemplateRevisionsQueryValidator
    : AbstractValidator<GetReportTemplateRevisionsQuery>
{
    public GetReportTemplateRevisionsQueryValidator() => RuleFor(query => query.Id).NotEmpty();
}

public sealed class GetReportTemplateRevisionQueryValidator
    : AbstractValidator<GetReportTemplateRevisionQuery>
{
    public GetReportTemplateRevisionQueryValidator()
    {
        RuleFor(query => query.Id).NotEmpty();
        RuleFor(query => query.RevisionNumber).GreaterThan(0);
    }
}
