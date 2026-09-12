using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR.Application.Common.Consts;

namespace ErpSystem.Modules.HR;

internal static class HrModuleDefinition
{
    public static ModuleDefinition Create()
    {
        var submodules = new[]
        {
            CreateSubmodule("basic-data", "Basic data", "/apps/hr/basic-data", Prefixes(
                "Addresses", "AddressTypes", "Categories", "CompanyGeographicScope",
                "Localizations", "OrganizationalStructure", "ReportsCategories", "SubCategories")),
            CreateSubmodule("recruitment", "Recruitment", "/apps/hr/recruitment", Prefixes("Recruitment")),
            CreateSubmodule("workforce", "Workforce planning", "/apps/hr/workforce", Prefixes(
                "FiscalYears", "WorkforcePlans", "WorkforceBudgets", "PositionEnvelopes",
                "EnvelopeAmendments", "StaffingRequests", "WorkforcePlanning")),
            CreateSubmodule("attendance", "Attendance", "/apps/hr/attendance", Prefixes("AttendanceDevices")),
            CreateSubmodule("analytics", "Analytics", "/apps/hr/analytics", Prefixes(
                "ReportTemplates", "CrystalReports", "ChangeLogs", "Hangfire", "DatabaseViews")),
            CreateSubmodule("administration", "Administration", "/apps/hr/administration", Prefixes(
                "ApiKeys", "Backups", "OfflineOperations", "Roles", "Users")),
            CreateSubmodule("collaboration", "Collaboration", "/apps/hr/collaboration", Prefixes(
                "Chat", "ChatUsers", "Conversations", "Messages", "Kanban", "BoardTask"))
        };

        var assigned = submodules.SelectMany(item => item.RequiredPermissions).ToArray();
        var expected = Permissions.GetTenantPermissions();
        var missing = expected.Except(assigned, StringComparer.Ordinal).ToArray();
        var duplicate = assigned.GroupBy(item => item, StringComparer.Ordinal)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();
        if (missing.Length > 0 || duplicate.Length > 0)
            throw new InvalidOperationException(
                $"HR permission catalog is incomplete. Missing: {string.Join(",", missing)}; " +
                $"duplicates: {string.Join(",", duplicate)}.");

        return new ModuleDefinition("hr", "HR", submodules, IsDefault: true)
        {
            Version = "1.0.0",
            RequiredModuleDependencies = ["platform"]
        };
    }

    private static SubmoduleDefinition CreateSubmodule(
        string code,
        string name,
        string entryPath,
        Func<string, bool> predicate) =>
        new(code, name, Permissions.GetTenantPermissions().Where(predicate).ToArray(), entryPath);

    private static Func<string, bool> Prefixes(params string[] prefixes) =>
        permission =>
        {
            var resource = permission.Split(':', 2)[0];
            return prefixes.Any(prefix =>
                string.Equals(resource, prefix, StringComparison.Ordinal) ||
                resource.StartsWith(prefix, StringComparison.Ordinal));
        };
}
