using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

public sealed class GlobalCrystalReportPolicy(ICurrentActor actor, ICurrentPermissionChecker permissions)
{
    public bool AccessAdministrator => permissions.HasPermission(ReportingPermissions.EditGlobalCrystalReportAccess);
    private static readonly IReadOnlyDictionary<string, string> EntityPermissions = new Dictionary<string, string>(StringComparer.Ordinal)
    {
        ["countries"] = "Countries:Edit", ["states"] = "States:Edit", ["districts"] = "Districts:Edit"
    };

    public bool Allows(string entityKey, string action = ReportingPermissions.ViewGlobalCrystalReports) =>
        actor.IsInRole("super_admin") &&
        EntityPermissions.TryGetValue(entityKey, out var entityPermission) &&
        permissions.HasPermission(ReportingPermissions.ViewGlobalCrystalReports) &&
        permissions.HasPermission(action) && permissions.HasPermission(entityPermission);

    public IReadOnlyList<string> EditableEntities() => EntityPermissions.Keys.Where(key => Allows(key)).ToArray();
}
