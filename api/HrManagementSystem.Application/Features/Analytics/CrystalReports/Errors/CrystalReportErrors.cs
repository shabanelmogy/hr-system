using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Errors;

public sealed class CrystalReportErrors(IStringLocalizer<CrystalReportDetailResponse> localizer)
{
    public Error CrystalReportNotFound => new("CrystalReport.NotFound", localizer[nameof(CrystalReportNotFound)], ErrorType.NotFound);
    public Error CrystalReportDuplicateKey => new("CrystalReport.DuplicateKey", localizer[nameof(CrystalReportDuplicateKey)], ErrorType.Conflict);
    public Error CrystalReportInvalidFile => new("CrystalReport.InvalidFile", localizer[nameof(CrystalReportInvalidFile)], ErrorType.Validation);
    public Error CrystalReportFileTooLarge => new("CrystalReport.FileTooLarge", localizer[nameof(CrystalReportFileTooLarge)], ErrorType.Validation);
    public Error CrystalReportInspectorUnavailable => new("CrystalReport.InspectorUnavailable", localizer[nameof(CrystalReportInspectorUnavailable)], ErrorType.Unexpected);
    public Error CrystalReportCatalogUnavailable => new("CrystalReport.CatalogUnavailable", localizer[nameof(CrystalReportCatalogUnavailable)], ErrorType.ServiceUnavailable);
    public Error CrystalReportRuntimeUnavailable => new("CrystalReport.RuntimeUnavailable", localizer[nameof(CrystalReportRuntimeUnavailable)], ErrorType.ServiceUnavailable);
    public Error CrystalReportSourceUnavailable => new("CrystalReport.SourceUnavailable", localizer[nameof(CrystalReportSourceUnavailable)], ErrorType.ServiceUnavailable);
    public Error CrystalReportRenderUnsupported => new("CrystalReport.RenderUnsupported", localizer[nameof(CrystalReportRenderUnsupported)], ErrorType.Validation);
    public Error CrystalReportInvalidRowVersion => new("CrystalReport.InvalidRowVersion", localizer[nameof(CrystalReportInvalidRowVersion)], ErrorType.Validation);
    public Error CrystalReportConcurrencyConflict => new("CrystalReport.ConcurrencyConflict", localizer[nameof(CrystalReportConcurrencyConflict)], ErrorType.Conflict);
    public Error CrystalReportInvalidRole => new("CrystalReport.InvalidRole", localizer[nameof(CrystalReportInvalidRole)], ErrorType.Validation);
    public Error CrystalReportInvalidRights => new("CrystalReport.InvalidRights", localizer[nameof(CrystalReportInvalidRights)], ErrorType.Validation);
    public Error CrystalReportVersionNotValidated => new("CrystalReport.VersionNotValidated", localizer[nameof(CrystalReportVersionNotValidated)], ErrorType.Validation);
}
