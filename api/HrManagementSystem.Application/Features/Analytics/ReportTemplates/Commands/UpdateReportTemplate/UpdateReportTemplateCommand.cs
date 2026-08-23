using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.UpdateReportTemplate;

public sealed record UpdateReportTemplateCommand(
    Guid Id,
    string Name,
    string? Description,
    string DataSourceKey,
    string DefinitionJson,
    string RowVersion)
    : ICommand<Result<ReportTemplateDetailResponse>>;

public sealed class UpdateReportTemplateCommandValidator
    : AbstractValidator<UpdateReportTemplateCommand>
{
    public UpdateReportTemplateCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.RowVersion)
            .NotEmpty()
            .Must(value => TryDecode(value, out _))
            .WithMessage("RowVersion must be a valid Base64 concurrency token.");
        Commands.ReportTemplateCommandRules.AddDefinitionRules(
            this,
            _ => Validation.ReportTemplateDefinitionSafety.CountriesFeatureKey,
            command => command.Name,
            command => command.Description,
            command => command.DataSourceKey,
            command => command.DefinitionJson);
    }

    internal static bool TryDecode(string? value, out byte[] rowVersion)
    {
        try
        {
            rowVersion = Convert.FromBase64String(value ?? string.Empty);
            return rowVersion.Length > 0;
        }
        catch (FormatException)
        {
            rowVersion = [];
            return false;
        }
    }
}
