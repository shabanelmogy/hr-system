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
    public void GlobalManagement_UsesSeparateGlobalActionsWithoutTenantMembership()
    {
        var controller = typeof(GlobalCrystalReportManagementController);
        Assert.Contains(controller.GetCustomAttributes<AuthorizeAttribute>(), attribute => attribute.Roles == PlatformRoleNames.SuperAdmin);
        AssertPermission(controller, nameof(GlobalCrystalReportManagementController.Create), ReportingPermissions.CreateGlobalCrystalReports);
        AssertPermission(controller, nameof(GlobalCrystalReportManagementController.UploadVersion), ReportingPermissions.UploadGlobalCrystalReports);
        AssertPermission(controller, nameof(GlobalCrystalReportManagementController.Publish), ReportingPermissions.PublishGlobalCrystalReports);
        AssertPermission(controller, nameof(GlobalCrystalReportManagementController.Download), ReportingPermissions.DownloadGlobalCrystalReports);
        AssertPermission(controller, nameof(GlobalCrystalReportManagementController.Archive), ReportingPermissions.ArchiveGlobalCrystalReports);
        AssertPermission(controller, nameof(GlobalCrystalReportManagementController.SaveAccess), ReportingPermissions.EditGlobalCrystalReportAccess);
        Assert.All(ReportingPermissions.GlobalReports, permission => Assert.True(permission.StartsWith("GlobalCrystalReports:", StringComparison.Ordinal) || permission.StartsWith("GlobalCrystalReportAccess:", StringComparison.Ordinal)));
    }
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
    public void GlobalDataExport_UsesAnIndependentGlobalGrantWithoutWeakeningTenantExports()
    {
        var controller = typeof(GlobalDataExportsController);
        Assert.Contains(controller.GetCustomAttributes<AuthorizeAttribute>(), attribute => attribute.Roles == PlatformRoleNames.SuperAdmin);
        Assert.Contains(controller.GetCustomAttributes<HasPermissionAttribute>(), attribute => attribute.Policy == ReportingPermissions.ExportGlobalData);
        Assert.Empty(controller.GetCustomAttributes<TenantMemberAttribute>());
        Assert.Single(typeof(ExportController).GetCustomAttributes<TenantMemberAttribute>());
        var definition = new ReportingModule().Definition;
        var global = Assert.Single(definition.Submodules, item => item.Code == "global-data-exports");
        Assert.Equal(PermissionAccessMode.Global, global.PermissionAccessMode);
        Assert.Contains(ReportingPermissions.ExportGlobalData, global.RequiredPermissions);
        Assert.DoesNotContain(ReportingPermissions.ExportGlobalData, ReportingPermissions.GlobalReports);
    }

    [Theory]
    [InlineData(nameof(ExportController.ExportExcel))]
    [InlineData(nameof(ExportController.ExportCsv))]
    public void ExistingFormatter_AppliesTheSameBoundedRequestEnvelope(string action)
    {
        var attribute = Assert.Single(typeof(ExportController).GetMethod(action)!
            .GetCustomAttributesData(), item => item.AttributeType == typeof(Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute));
        Assert.Equal(8L * 1024 * 1024, attribute.ConstructorArguments[0].Value);
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
    public void GlobalGeographyReports_RequireAuthenticationAndApplicationScopePolicy()
    {
        var definition = new ReportingModule().Definition;
        var globalReports = Assert.Single(
            definition.Submodules,
            item => item.Code == "global-geography-reports");

        Assert.Equal(PermissionAccessMode.Global, globalReports.PermissionAccessMode);
        Assert.Contains(ReportingPermissions.ViewGlobalCrystalReports, globalReports.RequiredPermissions);
        Assert.Contains(ReportingPermissions.ViewGlobalCrystalReports, ReportingPermissions.All);

        var controller = typeof(GlobalCrystalReportsController);
        var authorization = Assert.Single(controller.GetCustomAttributes<AuthorizeAttribute>(inherit: true));
        Assert.Null(authorization.Roles);
        Assert.Empty(controller.GetCustomAttributes<HasPermissionAttribute>(inherit: true));
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
