using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Validation;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.UpdateReportTemplate;

public sealed class UpdateReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
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
            ReportTemplateDefinitionSafety.ComputeHash(request.DefinitionJson));
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(CreateReportTemplateCommandHandler.ToResponse(template));
    }
}
