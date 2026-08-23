using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Validation;
using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;

public sealed class CreateReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    ReportTemplateErrors errors)
    : ICommandHandler<CreateReportTemplateCommand, Result<ReportTemplateDetailResponse>>
{
    public async Task<Result<ReportTemplateDetailResponse>> Handle(
        CreateReportTemplateCommand request,
        CancellationToken cancellationToken)
    {
        if (await store.NameExistsAsync(
                request.FeatureKey,
                request.Name.Trim(),
                null,
                cancellationToken))
        {
            return Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateDuplicateName);
        }

        var template = ReportTemplate.Create(
            request.FeatureKey,
            request.Name,
            request.Description,
            request.DataSourceKey,
            request.DefinitionJson,
            ReportTemplateDefinitionSafety.ComputeHash(request.DefinitionJson));
        store.Add(template);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(ToResponse(template));
    }

    internal static ReportTemplateDetailResponse ToResponse(ReportTemplate template) =>
        new(
            template.Id,
            template.FeatureKey,
            template.Name,
            template.Description,
            template.DataSourceKey,
            template.DefinitionJson,
            template.ContentHash,
            template.RevisionNumber,
            template.IsPublished,
            template.IsDeleted,
            template.CreatedOn,
            template.UpdatedOn,
            Convert.ToBase64String(template.RowVersion));
}
