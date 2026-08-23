using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Validation;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportDataSources;

public sealed record GetReportDataSourcesQuery(string FeatureKey)
    : IQuery<IReadOnlyList<ReportDataSourceDescriptorResponse>>;

public sealed class GetReportDataSourcesQueryValidator : AbstractValidator<GetReportDataSourcesQuery>
{
    public GetReportDataSourcesQueryValidator() =>
        RuleFor(query => query.FeatureKey)
            .NotEmpty()
            .Must(key => string.Equals(
                key,
                ReportTemplateDefinitionSafety.CountriesFeatureKey,
                StringComparison.OrdinalIgnoreCase));
}

public sealed class GetReportDataSourcesQueryHandler
    : IQueryHandler<GetReportDataSourcesQuery, IReadOnlyList<ReportDataSourceDescriptorResponse>>
{
    public Task<IReadOnlyList<ReportDataSourceDescriptorResponse>> Handle(
        GetReportDataSourcesQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<ReportDataSourceDescriptorResponse>>(
            [ReportTemplateDefinitionSafety.CountriesDescriptor()]);
}
