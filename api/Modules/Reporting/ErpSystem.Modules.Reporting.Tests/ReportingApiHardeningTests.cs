using System.Reflection;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Views.V1;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ReportingApiHardeningTests
{
    [Fact]
    public void ViewsController_RequiresDatabaseViewPermission()
    {
        var attribute = typeof(ViewsController).GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal(ReportingPermissions.ManageDatabaseViews, attribute.Policy);
    }
}
