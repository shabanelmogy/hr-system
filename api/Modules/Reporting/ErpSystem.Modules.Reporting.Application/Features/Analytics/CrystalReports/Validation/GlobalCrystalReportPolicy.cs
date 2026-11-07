using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

public sealed class GlobalCrystalReportPolicy(ICurrentActor actor, ICurrentPermissionChecker permissions)
{
    public bool AccessAdministrator => permissions.HasPermission(ReportingPermissions.EditGlobalCrystalReportAccess);
    private static readonly IReadOnlyDictionary<string, string> EntityPermissions = new Dictionary<string, string>(StringComparer.Ordinal)
    {
        ["countries"] = "Countries:Edit", ["states"] = "States:Edit", ["districts"] = "Districts:Edit",
        ["system-error-logs"] = "SystemErrorLogs:View"
    };

    public bool Allows(string entityKey, string action = ReportingPermissions.ViewGlobalCrystalReports) =>
        (entityKey != "system-error-logs" ||
            action is not (ReportingPermissions.ViewGlobalCrystalReportAccess or ReportingPermissions.EditGlobalCrystalReportAccess)) &&
        actor.IsInRole("super_admin") &&
        EntityPermissions.TryGetValue(entityKey, out var entityPermission) &&
        permissions.HasPermission(ReportingPermissions.ViewGlobalCrystalReports) &&
        permissions.HasPermission(action) && permissions.HasPermission(entityPermission);

    public bool BypassesRoleGrants(string entityKey) => AccessAdministrator ||
        entityKey == "system-error-logs" && Allows(entityKey);

    public IReadOnlyList<string> EditableEntities() => EntityPermissions.Keys.Where(key => Allows(key)).ToArray();
}
