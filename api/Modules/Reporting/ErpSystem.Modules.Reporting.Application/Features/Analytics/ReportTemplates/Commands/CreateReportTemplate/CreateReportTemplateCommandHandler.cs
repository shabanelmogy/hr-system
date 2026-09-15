using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.ReportTemplates.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;

public sealed class CreateReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    IReportTemplateContentHashProvider contentHash,
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
            contentHash.Compute(request.DefinitionJson));
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
