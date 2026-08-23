using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;

public sealed record CreateReportTemplateCommand(
    string FeatureKey,
    string Name,
    string? Description,
    string DataSourceKey,
    string DefinitionJson)
    : ICommand<Result<ReportTemplateDetailResponse>>;

public sealed class CreateReportTemplateCommandValidator
    : AbstractValidator<CreateReportTemplateCommand>
{
    public CreateReportTemplateCommandValidator() =>
        Commands.ReportTemplateCommandRules.AddDefinitionRules(
            this,
            command => command.FeatureKey,
            command => command.Name,
            command => command.Description,
            command => command.DataSourceKey,
            command => command.DefinitionJson);
}
