using System.Reflection;
using HrManagementSystem.Api.Features.Platform.BackgroundJobs.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Contracts;
using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Services;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

public sealed class BackgroundJobsControllerTests
{
    [Fact]
    public void GetDashboard_RequiresAuthenticationAndHangfireViewPermission()
    {
        var controllerAuthorize = typeof(BackgroundJobsController)
            .GetCustomAttribute<AuthorizeAttribute>();
        var action = typeof(BackgroundJobsController)
            .GetMethod(nameof(BackgroundJobsController.GetDashboard));
        var permission = action?.GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(controllerAuthorize);
        Assert.NotNull(permission);
        Assert.Equal(Permissions.ViewHangfireDashboard, permission.Policy);
    }

    [Fact]
    public void GetDashboard_ReturnsServiceSnapshot()
    {
        var expected = new BackgroundJobDashboardResponse(
            Servers: 2,
            Queues: 1,
            Enqueued: 3,
            Scheduled: 4,
            Processing: 5,
            Succeeded: 6,
            Failed: 7,
            GeneratedAt: DateTimeOffset.UtcNow);
        var controller = new BackgroundJobsController(new StubDashboardService(expected));

        var result = Assert.IsType<OkObjectResult>(controller.GetDashboard());

        Assert.Same(expected, result.Value);
    }

    private sealed class StubDashboardService(BackgroundJobDashboardResponse response)
        : IBackgroundJobDashboardService
    {
        public BackgroundJobDashboardResponse GetDashboard() => response;
    }
}
