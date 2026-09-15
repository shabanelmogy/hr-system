using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Validation;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Commands.UpdateReportTemplate;

public sealed class UpdateReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    IReportTemplateContentHashProvider contentHash,
    ReportTemplateErrors errors)
    : ICommandHandler<UpdateReportTemplateCommand, Result<ReportTemplateDetailResponse>>
{
    public async Task<Result<ReportTemplateDetailResponse>> Handle(
        UpdateReportTemplateCommand request,
        CancellationToken cancellationToken)
    {
        var template = await store.GetForUpdateAsync(request.Id, cancellationToken);
        if (template is null)
            return Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateNotFound);
        if (template.IsDeleted)
            return Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateArchived);
        if (await store.NameExistsAsync(
                template.FeatureKey,
                request.Name.Trim(),
                template.Id,
                cancellationToken))
        {
            return Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateDuplicateName);
        }

        UpdateReportTemplateCommandValidator.TryDecode(request.RowVersion, out var rowVersion);
        store.ApplyOriginalRowVersion(template, rowVersion);
        template.Update(
            request.Name,
            request.Description,
            request.DataSourceKey,
            request.DefinitionJson,
            contentHash.Compute(request.DefinitionJson));
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(CreateReportTemplateCommandHandler.ToResponse(template));
    }
}
