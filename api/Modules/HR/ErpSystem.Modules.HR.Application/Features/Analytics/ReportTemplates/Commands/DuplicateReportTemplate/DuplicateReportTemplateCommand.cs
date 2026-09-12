using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Commands.DuplicateReportTemplate;

public sealed record DuplicateReportTemplateCommand(Guid Id, string Name)
    : ICommand<Result<ReportTemplateDetailResponse>>;

public sealed class DuplicateReportTemplateCommandValidator
    : AbstractValidator<DuplicateReportTemplateCommand>
{
    public DuplicateReportTemplateCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.Name).NotEmpty().MaximumLength(150);
    }
}
