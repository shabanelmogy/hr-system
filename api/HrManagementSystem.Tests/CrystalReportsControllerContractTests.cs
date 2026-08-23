using System.Reflection;
using HrManagementSystem.Api.Features.Analytics.CrystalReports.V1;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

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
    [InlineData(nameof(CrystalReportsController.ImportLegacy), "CrystalReports:Create")]
    public void MutationEndpoints_DeclareCoarsePermission(string action, string permission)
    {
        var method = typeof(CrystalReportsController).GetMethod(action)!;
        var attribute = method.GetCustomAttribute<HasPermissionAttribute>();
        Assert.NotNull(attribute);
        Assert.Equal(permission, attribute.Policy);
    }

    [Fact]
    public void LegacyCatalog_RequiresReportAccessManagementPermission()
    {
        var method = typeof(CrystalReportsController)
            .GetMethod(nameof(CrystalReportsController.GetLegacyCandidates))!;
        var attribute = method.GetCustomAttribute<HasPermissionAttribute>();
        Assert.Equal("CrystalReports:ManageAccess", attribute?.Policy);
    }

    [Fact]
    public void Render_UsesViewPermission_AndManagedIdRoute()
    {
        var method = typeof(CrystalReportsController)
            .GetMethod(nameof(CrystalReportsController.Render))!;
        var permission = method.GetCustomAttribute<HasPermissionAttribute>();
        var route = method.GetCustomAttribute<HttpPostAttribute>();

        Assert.Equal("CrystalReports:View", permission?.Policy);
        Assert.Equal("{id:guid}/render", route?.Template);
    }
}
