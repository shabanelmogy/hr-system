using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;

public sealed class ReportTemplateErrors(
    IStringLocalizer<ReportTemplateDetailResponse> localizer)
{
    public Error ReportTemplateNotFound => new(
        "ReportTemplate.NotFound",
        localizer[nameof(ReportTemplateNotFound)],
        ErrorType.NotFound);

    public Error ReportTemplateDuplicateName => new(
        "ReportTemplate.DuplicateName",
        localizer[nameof(ReportTemplateDuplicateName)],
        ErrorType.Conflict);

    public Error ReportTemplateArchived => new(
        "ReportTemplate.Archived",
        localizer[nameof(ReportTemplateArchived)],
        ErrorType.Validation);

    public Error ReportTemplateRevisionNotFound => new(
        "ReportTemplate.RevisionNotFound",
        localizer[nameof(ReportTemplateRevisionNotFound)],
        ErrorType.NotFound);
}
