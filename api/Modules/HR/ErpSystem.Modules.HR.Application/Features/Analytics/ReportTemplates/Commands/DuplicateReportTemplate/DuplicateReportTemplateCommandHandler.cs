using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Contracts;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Errors;
using ErpSystem.Modules.HR.Domain.Analytics.ReportTemplates.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Commands.DuplicateReportTemplate;

public sealed class DuplicateReportTemplateCommandHandler(
    IReportTemplateStore store,
    IUnitOfWork unitOfWork,
    ReportTemplateErrors errors)
    : ICommandHandler<DuplicateReportTemplateCommand, Result<ReportTemplateDetailResponse>>
{
    public async Task<Result<ReportTemplateDetailResponse>> Handle(
        DuplicateReportTemplateCommand request,
        CancellationToken cancellationToken)
    {
        var source = await store.GetForUpdateAsync(request.Id, cancellationToken);
        if (source is null)
            return Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateNotFound);
        if (await store.NameExistsAsync(
                source.FeatureKey,
                request.Name.Trim(),
                null,
                cancellationToken))
        {
            return Result.Failure<ReportTemplateDetailResponse>(errors.ReportTemplateDuplicateName);
        }

        var copy = ReportTemplate.Create(
            source.FeatureKey,
            request.Name,
            source.Description,
            source.DataSourceKey,
            source.DefinitionJson,
            source.ContentHash);
        store.Add(copy);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(CreateReportTemplateCommandHandler.ToResponse(copy));
    }
}
