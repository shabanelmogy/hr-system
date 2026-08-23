using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.UpdateReportTemplate;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.ChangeReportTemplateLifecycle;

public sealed class PublishReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    ReportTemplateErrors errors)
    : ICommandHandler<PublishReportTemplateCommand, Result>
{
    public async Task<Result> Handle(PublishReportTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await store.GetForUpdateAsync(request.Id, cancellationToken);
        if (template is null)
            return Result.Failure(errors.ReportTemplateNotFound);
        if (template.IsDeleted)
            return Result.Failure(errors.ReportTemplateArchived);
        if (template.IsPublished)
            return Result.Success();

        LifecycleConcurrency.ApplyRowVersion(store, template, request.RowVersion);
        template.Publish();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed class UnpublishReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    ReportTemplateErrors errors)
    : ICommandHandler<UnpublishReportTemplateCommand, Result>
{
    public async Task<Result> Handle(UnpublishReportTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await store.GetForUpdateAsync(request.Id, cancellationToken);
        if (template is null)
            return Result.Failure(errors.ReportTemplateNotFound);
        if (template.IsDeleted)
            return Result.Failure(errors.ReportTemplateArchived);
        if (!template.IsPublished)
            return Result.Success();

        LifecycleConcurrency.ApplyRowVersion(store, template, request.RowVersion);
        template.Unpublish();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed class ArchiveReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    ReportTemplateErrors errors)
    : ICommandHandler<ArchiveReportTemplateCommand, Result>
{
    public async Task<Result> Handle(ArchiveReportTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await store.GetForUpdateAsync(request.Id, cancellationToken);
        if (template is null)
            return Result.Failure(errors.ReportTemplateNotFound);
        if (template.IsDeleted)
            return Result.Success();

        LifecycleConcurrency.ApplyRowVersion(store, template, request.RowVersion);
        template.IsDeleted = true;
        template.DeletedById = currentActor.UserId;
        template.DeletedByPc = Environment.MachineName;
        template.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
        template.RecordLifecycleRevision("Archive");
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed class RestoreReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    ReportTemplateErrors errors)
    : ICommandHandler<RestoreReportTemplateCommand, Result>
{
    public async Task<Result> Handle(RestoreReportTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await store.GetForUpdateAsync(request.Id, cancellationToken);
        if (template is null)
            return Result.Failure(errors.ReportTemplateNotFound);
        if (!template.IsDeleted)
            return Result.Success();

        LifecycleConcurrency.ApplyRowVersion(store, template, request.RowVersion);
        template.IsDeleted = false;
        template.DeletedById = null;
        template.DeletedByPc = null;
        template.DeletedOn = null;
        template.RecordLifecycleRevision("Restore");
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

file static class LifecycleConcurrency
{
    public static void ApplyRowVersion(
        IReportTemplateStore store,
        HrManagementSystem.Domain.Analytics.ReportTemplates.Entities.ReportTemplate template,
        string value)
    {
        UpdateReportTemplateCommandValidator.TryDecode(value, out var rowVersion);
        store.ApplyOriginalRowVersion(template, rowVersion);
    }
}
