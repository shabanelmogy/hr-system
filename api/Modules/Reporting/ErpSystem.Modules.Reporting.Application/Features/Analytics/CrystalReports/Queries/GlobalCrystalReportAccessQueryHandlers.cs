using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed class GetGlobalCrystalReportRolesQueryHandler(GlobalCrystalReportPolicy policy,
    IGlobalCrystalReportAccessStore access, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportRolesQuery, Result<PlatformRoleScopePage>>
{
    public async Task<Result<PlatformRoleScopePage>> Handle(GetGlobalCrystalReportRolesQuery request, CancellationToken cancellationToken) =>
        policy.Allows(request.EntityKey, ReportingPermissions.EditGlobalCrystalReportAccess)
            ? Result.Success(await access.RolesAsync(request.Search, request.Page, request.PageSize, cancellationToken))
            : Result.Failure<PlatformRoleScopePage>(errors.GlobalCrystalReportForbidden);
}

public sealed class GetGlobalCrystalReportAccessQueryHandler(IGlobalCrystalReportStore store,
    IGlobalCrystalReportAccessStore access, GlobalCrystalReportPolicy policy, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportAccessQuery, Result<GlobalCrystalReportAccessResponse>>
{
    public async Task<Result<GlobalCrystalReportAccessResponse>> Handle(GetGlobalCrystalReportAccessQuery request, CancellationToken cancellationToken)
    {
        if (policy.EditableEntities().Count == 0) return Result.Failure<GlobalCrystalReportAccessResponse>(errors.GlobalCrystalReportForbidden);
        var report = await store.FindAsync(request.ReportId, cancellationToken);
        if (report == null || !policy.Allows(report.EntityKey)) return Result.Failure<GlobalCrystalReportAccessResponse>(errors.CrystalReportNotFound);
        var manageAccess = policy.Allows(report.EntityKey, ReportingPermissions.EditGlobalCrystalReportAccess);
        var edit = !report.IsDeleted && manageAccess;
        var view = manageAccess || policy.Allows(report.EntityKey, ReportingPermissions.ViewGlobalCrystalReportAccess);
        var rights = new List<string>();
        foreach (var right in Enum.GetValues<CrystalReportRight>().Where(right => right != CrystalReportRight.None))
            if (edit || await access.HasRightAsync(report.Id, right, cancellationToken)) rights.Add(right.ToString());
        return Result.Success(new GlobalCrystalReportAccessResponse(view ? await access.GrantsAsync(report.Id, cancellationToken) : [],
            rights, view, edit, Convert.ToBase64String(report.RowVersion)));
    }
}

