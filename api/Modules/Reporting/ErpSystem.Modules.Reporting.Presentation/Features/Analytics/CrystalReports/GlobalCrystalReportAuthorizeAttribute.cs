using ErpSystem.Modules.Platform.Contracts.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports;

/// <summary>Chooses the existing HTTP permission policy; report scope and grants are checked by CQRS.</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class GlobalCrystalReportAuthorizeAttribute : TypeFilterAttribute
{
    public GlobalCrystalReportAuthorizeAttribute(bool download = false) : base(typeof(GlobalCrystalReportAuthorizationFilter))
    {
        Download = download;
        Arguments = [download];
    }
    public bool Download { get; }
}

public sealed class GlobalCrystalReportAuthorizationFilter(IAuthorizationService authorization, bool download)
    : IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user.Identity?.IsAuthenticated != true)
        {
            context.Result = new ChallengeResult();
            return;
        }
        var platform = user.IsInRole(PlatformRoleNames.SuperAdmin);
        var permission = platform
            ? download ? ReportingPermissions.DownloadGlobalCrystalReports : ReportingPermissions.ViewGlobalCrystalReports
            : download ? ReportingPermissions.DownloadCrystalReports : ReportingPermissions.ViewCrystalReports;
        if (!(await authorization.AuthorizeAsync(user, permission)).Succeeded)
            context.Result = new ForbidResult();
    }
}
