using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateRevisions;

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
