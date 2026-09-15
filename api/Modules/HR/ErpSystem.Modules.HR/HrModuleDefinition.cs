using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR.Contracts.Authorization;

namespace ErpSystem.Modules.HR;

internal static class HrModuleDefinition
{
    public static ModuleDefinition Create() =>
        new("hr", "HR",
        [
            new SubmoduleDefinition(
                "basic-data",
                "Basic data",
                HrPermissions.OrganizationalStructure,
                "/apps/hr/basic-data"),
            new SubmoduleDefinition(
                "recruitment",
                "Recruitment",
                HrPermissions.Recruitment,
                "/apps/hr/recruitment"),
            new SubmoduleDefinition(
                "workforce",
                "Workforce planning",
                HrPermissions.Workforce,
                "/apps/hr/workforce"),
            new SubmoduleDefinition(
                "attendance",
                "Attendance",
                HrPermissions.Attendance,
                "/apps/hr/attendance")
        ],
        IsDefault: true)
        {
            Version = "1.0.0",
            RequiredModuleDependencies = ["platform"]
        };
}