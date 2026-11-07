using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

public sealed class GlobalCrystalReportConsumerPolicy(ICurrentActor actor, ICurrentPermissionChecker permissions)
{
    public bool PlatformReader => actor.IsInRole("super_admin") &&
        permissions.HasPermission(ReportingPermissions.ViewGlobalCrystalReports);

    public bool Allows(string entityKey, bool download = false)
    {
        if (entityKey == "system-error-logs")
            return !string.IsNullOrWhiteSpace(actor.UserId) && PlatformReader &&
                permissions.HasPermission("SystemErrorLogs:View") &&
                (!download || permissions.HasPermission(ReportingPermissions.DownloadGlobalCrystalReports));
        if (entityKey is not ("countries" or "states" or "districts")) return false;
        if (PlatformReader) return !download || permissions.HasPermission(ReportingPermissions.DownloadGlobalCrystalReports);
        if (actor.IsInRole("super_admin")) return false;
        var permission = entityKey switch
        {
            "countries" => "Countries:View", "states" => "States:View", _ => "Districts:View"
        };
        return !string.IsNullOrWhiteSpace(actor.UserId) && !string.IsNullOrWhiteSpace(actor.TenantId) &&
            actor.CompanyId > 0 && permissions.HasPermission(permission) &&
            permissions.HasPermission(download ? ReportingPermissions.DownloadCrystalReports : ReportingPermissions.ViewCrystalReports);
    }
}
