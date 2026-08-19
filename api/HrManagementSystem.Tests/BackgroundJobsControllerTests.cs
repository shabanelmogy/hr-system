using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Security.Claims;
using HrManagementSystem.Api.Features.Platform.BackgroundJobs.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Contracts;
using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Services;
using HrManagementSystem.Infrastructure.Hangfire;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

public sealed class BackgroundJobsControllerTests
{
    [Fact]
    public void Actions_RequireAuthenticationAndHangfireViewPermission()
    {
        var controllerAuthorize = typeof(BackgroundJobsController)
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(controllerAuthorize);

        foreach (var actionName in new[]
                 {
                     nameof(BackgroundJobsController.GetDashboard),
                     nameof(BackgroundJobsController.OpenDashboard)
                 })
        {
            var action = typeof(BackgroundJobsController).GetMethod(actionName);
            var permission = action?.GetCustomAttribute<HasPermissionAttribute>();

            Assert.NotNull(permission);
            Assert.Equal(Permissions.ViewHangfireDashboard, permission.Policy);
        }
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

    [Fact]
    public void OpenDashboard_SetsScopedSecureCookieAndRedirects()
    {
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(10);
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(
                    JwtRegisteredClaimNames.Exp,
                    expiresAt.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture))],
                "TestAuthentication"))
        };
        httpContext.Request.Headers.Authorization = "Bearer test-access-token";

        var controller = new BackgroundJobsController(
            new StubDashboardService(CreateDashboardResponse()))
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };

        var result = Assert.IsType<RedirectResult>(controller.OpenDashboard());

        Assert.Equal(HangfireSessionAuthentication.DashboardPath, result.Url);
        var setCookie = Assert.Single(httpContext.Response.Headers.SetCookie);
        Assert.Contains(
            $"{HangfireSessionAuthentication.CookieName}=test-access-token",
            setCookie,
            StringComparison.Ordinal);
        Assert.Contains("path=/hangfire", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("httponly", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", setCookie, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Basic credentials")]
    [InlineData("Bearer")]
    public void OpenDashboard_RejectsMissingOrInvalidBearerHeader(string? authorization)
    {
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(
                    JwtRegisteredClaimNames.Exp,
                    DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds()
                        .ToString(CultureInfo.InvariantCulture))],
                "TestAuthentication"))
        };
        if (authorization is not null)
            httpContext.Request.Headers.Authorization = authorization;

        var controller = new BackgroundJobsController(
            new StubDashboardService(CreateDashboardResponse()))
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };

        Assert.IsType<UnauthorizedResult>(controller.OpenDashboard());
        Assert.Equal(0, httpContext.Response.Headers.SetCookie.Count);
    }

    private static BackgroundJobDashboardResponse CreateDashboardResponse() =>
        new(
            Servers: 0,
            Queues: 0,
            Enqueued: 0,
            Scheduled: 0,
            Processing: 0,
            Succeeded: 0,
            Failed: 0,
            GeneratedAt: DateTimeOffset.UtcNow);

    private sealed class StubDashboardService(BackgroundJobDashboardResponse response)
        : IBackgroundJobDashboardService
    {
        public BackgroundJobDashboardResponse GetDashboard() => response;
    }
}
