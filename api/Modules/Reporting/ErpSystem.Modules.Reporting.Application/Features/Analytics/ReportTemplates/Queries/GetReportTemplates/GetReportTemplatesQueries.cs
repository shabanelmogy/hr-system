using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Validation;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplates;

public sealed record GetPublishedReportTemplatesQuery(string FeatureKey)
    : IQuery<IReadOnlyList<ReportTemplateListItemResponse>>;

public sealed record GetReportTemplatesManagementQuery(
    string FeatureKey,
    string Status = "active")
    : IQuery<IReadOnlyList<ReportTemplateListItemResponse>>;

public sealed class GetPublishedReportTemplatesQueryValidator
    : AbstractValidator<GetPublishedReportTemplatesQuery>
{
    public GetPublishedReportTemplatesQueryValidator() =>
        RuleFor(query => query.FeatureKey)
            .NotEmpty()
            .MaximumLength(64)
            .Must(key => string.Equals(
                key,
                ReportTemplateDefinitionSafety.CountriesFeatureKey,
                StringComparison.OrdinalIgnoreCase));
}

public sealed class GetReportTemplatesManagementQueryValidator
    : AbstractValidator<GetReportTemplatesManagementQuery>
{
    public GetReportTemplatesManagementQueryValidator()
    {
        RuleFor(query => query.FeatureKey)
            .NotEmpty()
            .MaximumLength(64)
            .Must(key => string.Equals(
                key,
                ReportTemplateDefinitionSafety.CountriesFeatureKey,
                StringComparison.OrdinalIgnoreCase));
        RuleFor(query => query.Status)
            .NotEmpty()
            .Must(status => new[] { "active", "archived", "all" }
                .Contains(status, StringComparer.OrdinalIgnoreCase));
    }
}
