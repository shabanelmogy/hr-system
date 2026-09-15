using ErpSystem.Modules.Platform.Presentation.Features.Platform.BackgroundJobs.V1;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class BackgroundNotificationJobTests
{
    [Fact]
    public void BackgroundJobsController_IsPlatformOwnedAndVersioned()
    {
        var route = typeof(BackgroundJobsController).GetCustomAttributes(typeof(RouteAttribute), true).OfType<RouteAttribute>().Single();
        Assert.StartsWith("api/v{version:apiVersion}", route.Template, StringComparison.Ordinal);
        Assert.StartsWith("ErpSystem.Modules.Platform", typeof(BackgroundJobsController).Assembly.GetName().Name, StringComparison.Ordinal);
    }
}