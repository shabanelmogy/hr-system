using System.Reflection;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Dashboard.V1;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Exporting.V1;
using Microsoft.AspNetCore.Authorization;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ReportingAuthorizationTests
{
    [Fact]
    public void DashboardAction_RequiresDedicatedReportingPermission()
    {
        AssertPermission(
            typeof(DashboardController),
            nameof(DashboardController.GetUsersCount),
            ReportingPermissions.ViewDashboard);
    }

    [Fact]
    public void ExportActions_RequireDedicatedReportingPermission()
    {
        AssertPermission(typeof(ExportController), nameof(ExportController.ExportExcel), ReportingPermissions.ExportData);
        AssertPermission(typeof(ExportController), nameof(ExportController.ExportCsv), ReportingPermissions.ExportData);
        AssertPermission(typeof(ExportPdfController), nameof(ExportPdfController.GenerateSyncfusionPdf), ReportingPermissions.ExportData);
    }

    [Fact]
    public void ReportingCatalog_DeclaresDashboardAndExportPermissions()
    {
        var definition = new ReportingModule().Definition;
        var analytics = Assert.Single(definition.Submodules, item => item.Code == "analytics");

        Assert.Contains(ReportingPermissions.ViewDashboard, analytics.RequiredPermissions);
        Assert.Contains(ReportingPermissions.ExportData, analytics.RequiredPermissions);
        Assert.Contains(ReportingPermissions.ViewDashboard, ReportingPermissions.All);
        Assert.Contains(ReportingPermissions.ExportData, ReportingPermissions.All);
    }

    [Fact]
    public void GlobalGeographyReports_AreGlobalAndRestrictedToSuperAdmin()
    {
        var definition = new ReportingModule().Definition;
        var globalReports = Assert.Single(
            definition.Submodules,
            item => item.Code == "global-geography-reports");

        Assert.Equal(PermissionAccessMode.Global, globalReports.PermissionAccessMode);
        Assert.Contains(ReportingPermissions.ViewGlobalCrystalReports, globalReports.RequiredPermissions);
        Assert.Contains(ReportingPermissions.ViewGlobalCrystalReports, ReportingPermissions.All);

        var controller = typeof(GlobalCrystalReportsController);
        var authorization = Assert.Single(
            controller.GetCustomAttributes<AuthorizeAttribute>(inherit: true),
            attribute => attribute.Roles == PlatformRoleNames.SuperAdmin);
        var permission = Assert.Single(
            controller.GetCustomAttributes<HasPermissionAttribute>(inherit: true),
            attribute => attribute.Policy == ReportingPermissions.ViewGlobalCrystalReports);

        Assert.Equal(PlatformRoleNames.SuperAdmin, authorization.Roles);
        Assert.Equal(ReportingPermissions.ViewGlobalCrystalReports, permission.Policy);
    }

    private static void AssertPermission(Type controller, string actionName, string expectedPermission)
    {
        var method = controller.GetMethod(actionName, BindingFlags.Instance | BindingFlags.Public);
        Assert.NotNull(method);

        var permission = method!.GetCustomAttribute<HasPermissionAttribute>(inherit: true);
        Assert.NotNull(permission);
        Assert.Equal(expectedPermission, permission!.Policy);
    }
}
