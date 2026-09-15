using System.Reflection;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportsControllerContractTests
{
    [Fact]
    public void Controller_UsesVersionedCrystalReportsResourceRoute()
    {
        var route = typeof(CrystalReportsController).GetCustomAttribute<RouteAttribute>();
        Assert.Equal("api/v{version:apiVersion}/crystal-reports", route?.Template);
    }

    [Theory]
    [InlineData(nameof(CrystalReportsController.Create), "CrystalReports:Create")]
    [InlineData(nameof(CrystalReportsController.AddVersion), "CrystalReports:Upload")]
    [InlineData(nameof(CrystalReportsController.Publish), "CrystalReports:Publish")]
    [InlineData(nameof(CrystalReportsController.ReplaceGrants), "CrystalReports:ManageAccess")]
    [InlineData(nameof(CrystalReportsController.Archive), "CrystalReports:Delete")]
    [InlineData(nameof(CrystalReportsController.ImportDeploymentReport), "CrystalReports:Create")]
    public void MutationEndpoints_DeclareCoarsePermission(string action, string permission)
    {
        var attribute = typeof(CrystalReportsController).GetMethod(action)!.GetCustomAttribute<HasPermissionAttribute>();
        Assert.NotNull(attribute);
        Assert.Equal(permission, attribute.Policy);
    }

    [Fact]
    public void DeploymentCatalog_RequiresManageAccessPermission()
    {
        var attribute = typeof(CrystalReportsController)
            .GetMethod(nameof(CrystalReportsController.GetDeploymentCandidates))!
            .GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("CrystalReports:ManageAccess", attribute.Policy);
    }

    [Fact]
    public void GrantRoleOptions_RequiresManageAccessPermission()
    {
        var attribute = typeof(CrystalReportsController)
            .GetMethod(nameof(CrystalReportsController.GetGrantRoleOptions))!
            .GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("CrystalReports:ManageAccess", attribute.Policy);
    }

    [Fact]
    public void HistoricalVersionDownload_RequiresManageAccessPermission()
    {
        var attribute = typeof(CrystalReportsController)
            .GetMethod(nameof(CrystalReportsController.DownloadVersion))!
            .GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("CrystalReports:ManageAccess", attribute.Policy);
    }
}
