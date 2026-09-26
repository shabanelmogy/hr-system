using System.Reflection;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Views.V1;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ReportingApiHardeningTests
{
    [Fact]
    public void ViewsController_RequiresActionSpecificDatabaseViewPermissions()
    {
        Assert.Equal(
            ReportingPermissions.EditDatabaseViews,
            typeof(ViewsController).GetMethod(nameof(ViewsController.CreateOrAlterView))!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(
            ReportingPermissions.ViewDatabaseViews,
            typeof(ViewsController).GetMethod(nameof(ViewsController.GetAllViews))!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(
            ReportingPermissions.DeleteDatabaseViews,
            typeof(ViewsController).GetMethod(nameof(ViewsController.DropView))!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }
}
