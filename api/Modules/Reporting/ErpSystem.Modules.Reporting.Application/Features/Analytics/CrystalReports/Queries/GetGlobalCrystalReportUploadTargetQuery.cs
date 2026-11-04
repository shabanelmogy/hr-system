using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record GetGlobalCrystalReportUploadTargetQuery(string EntityKey, string FileName)
    : IQuery<Result<CrystalReportUploadTargetResponse>>;

public sealed class GetGlobalCrystalReportUploadTargetQueryValidator : AbstractValidator<GetGlobalCrystalReportUploadTargetQuery>
{
    public GetGlobalCrystalReportUploadTargetQueryValidator()
    {
        RuleFor(request => request.EntityKey).NotEmpty().Must(key => key is "countries" or "states" or "districts");
        RuleFor(request => request.FileName).NotEmpty().MaximumLength(255);
    }
}

public sealed class GetGlobalCrystalReportUploadTargetQueryHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, IGlobalCrystalReportAccessStore access, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportUploadTargetQuery, Result<CrystalReportUploadTargetResponse>>
{
    public async Task<Result<CrystalReportUploadTargetResponse>> Handle(GetGlobalCrystalReportUploadTargetQuery request,
        CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, ReportingPermissions.CreateGlobalCrystalReports))
            return Result.Failure<CrystalReportUploadTargetResponse>(errors.GlobalCrystalReportForbidden);
        if (string.IsNullOrWhiteSpace(request.FileName) || request.FileName.Length > 255 ||
            request.FileName.Contains('/', StringComparison.Ordinal) || request.FileName.Contains('\\', StringComparison.Ordinal) ||
            request.FileName.Any(char.IsControl) || !request.FileName.EndsWith(".rpt", StringComparison.OrdinalIgnoreCase))
            return Result.Failure<CrystalReportUploadTargetResponse>(errors.CrystalReportInvalidFile);
        var key = CrystalReportRules.FileStemToKey(request.FileName);
        if (!CrystalReportRules.IsValidKey(key) || key.Length > 128 || !CrystalReportRules.MatchesEntityPrefix(key, request.EntityKey))
            return Result.Failure<CrystalReportUploadTargetResponse>(errors.CrystalReportInvalidFile);

        var report = await store.FindByKeyAsync(request.EntityKey, key, cancellationToken);
        if (report is null)
            return Result.Success(new CrystalReportUploadTargetResponse(null, false));
        var detail = await store.DetailAsync(report.Id, cancellationToken);
        var allowed = !report.IsDeleted && detail is not null &&
            policy.Allows(report.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) &&
            policy.Allows(report.EntityKey, ReportingPermissions.PublishGlobalCrystalReports) &&
            (policy.AccessAdministrator ||
             await access.HasRightAsync(report.Id, CrystalReportRight.Upload, cancellationToken) &&
             await access.HasRightAsync(report.Id, CrystalReportRight.Publish, cancellationToken));
        return Result.Success(new CrystalReportUploadTargetResponse(detail, allowed));
    }
}
