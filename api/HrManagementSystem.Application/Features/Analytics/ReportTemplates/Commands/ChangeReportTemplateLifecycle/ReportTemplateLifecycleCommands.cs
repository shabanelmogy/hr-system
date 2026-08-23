using HrManagementSystem.Application.Abstractions.Messaging;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.ChangeReportTemplateLifecycle;

public sealed record PublishReportTemplateCommand(Guid Id, string RowVersion) : ICommand<Result>;
public sealed record UnpublishReportTemplateCommand(Guid Id, string RowVersion) : ICommand<Result>;
public sealed record ArchiveReportTemplateCommand(Guid Id, string RowVersion) : ICommand<Result>;
public sealed record RestoreReportTemplateCommand(Guid Id, string RowVersion) : ICommand<Result>;

public sealed class PublishReportTemplateCommandValidator : AbstractValidator<PublishReportTemplateCommand>
{
    public PublishReportTemplateCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        AddRowVersionRule(RuleFor(command => command.RowVersion));
    }

    internal static void AddRowVersionRule<T>(IRuleBuilder<T, string> rule) =>
        rule.NotEmpty()
            .Must(value => Commands.UpdateReportTemplate.UpdateReportTemplateCommandValidator.TryDecode(value, out _))
            .WithMessage("RowVersion must be a valid Base64 concurrency token.");
}

public sealed class UnpublishReportTemplateCommandValidator : AbstractValidator<UnpublishReportTemplateCommand>
{
    public UnpublishReportTemplateCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        PublishReportTemplateCommandValidator.AddRowVersionRule(RuleFor(command => command.RowVersion));
    }
}

public sealed class ArchiveReportTemplateCommandValidator : AbstractValidator<ArchiveReportTemplateCommand>
{
    public ArchiveReportTemplateCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        PublishReportTemplateCommandValidator.AddRowVersionRule(RuleFor(command => command.RowVersion));
    }
}

public sealed class RestoreReportTemplateCommandValidator : AbstractValidator<RestoreReportTemplateCommand>
{
    public RestoreReportTemplateCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        PublishReportTemplateCommandValidator.AddRowVersionRule(RuleFor(command => command.RowVersion));
    }
}
