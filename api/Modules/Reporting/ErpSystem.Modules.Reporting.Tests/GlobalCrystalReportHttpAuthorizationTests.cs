using System.Security.Claims;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class GlobalCrystalReportHttpAuthorizationTests
{
    [Theory]
    [InlineData(false, false, "CrystalReports:View")]
    [InlineData(false, true, "CrystalReports:Download")]
    [InlineData(true, false, "GlobalCrystalReports:View")]
    [InlineData(true, true, "GlobalCrystalReports:Download")]
    public async Task SelectsTheLivePermissionPolicy_AndPropagatesDenial(bool platform, bool download, string expected)
    {
        var service = new AuthorizationSpy();
        var context = Context(platform, authenticated: true);
        var filter = new GlobalCrystalReportAuthorizationFilter(service, download);
        await filter.OnAuthorizationAsync(context);
        Assert.Equal(expected, service.Policy);
        Assert.IsType<ForbidResult>(context.Result);
        service.Allowed = true;
        context.Result = null;
        await filter.OnAuthorizationAsync(context);
        Assert.Null(context.Result);
    }

    [Fact]
    public async Task AnonymousRequestsAreChallengedBeforePermissionEvaluation()
    {
        var service = new AuthorizationSpy();
        var context = Context(platform: false, authenticated: false);
        await new GlobalCrystalReportAuthorizationFilter(service, download: false).OnAuthorizationAsync(context);
        Assert.IsType<ChallengeResult>(context.Result);
        Assert.Null(service.Policy);
    }

    [Theory]
    [InlineData(nameof(GlobalCrystalReportsController.Get), false)]
    [InlineData(nameof(GlobalCrystalReportsController.Render), false)]
    [InlineData(nameof(GlobalCrystalReportsController.Source), true)]
    public void EveryPublicOperationHasTheDynamicPermissionBoundary(string action, bool download)
    {
        var attribute = Assert.Single(typeof(GlobalCrystalReportsController).GetMethod(action)!
            .GetCustomAttributes(typeof(GlobalCrystalReportAuthorizeAttribute), false).Cast<GlobalCrystalReportAuthorizeAttribute>());
        Assert.Equal(download, attribute.Download);
    }

    private static AuthorizationFilterContext Context(bool platform, bool authenticated)
    {
        var http = new DefaultHttpContext();
        http.User = new ClaimsPrincipal(new ClaimsIdentity(platform ? [new Claim(ClaimTypes.Role, "super_admin")] : [],
            authenticated ? "fixture" : null));
        return new AuthorizationFilterContext(new ActionContext(http, new RouteData(), new ActionDescriptor()), []);
    }

    private sealed class AuthorizationSpy : IAuthorizationService
    {
        public bool Allowed { get; set; }
        public string? Policy { get; private set; }
        public Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user, object? resource, string policyName)
        {
            Policy = policyName;
            return Task.FromResult(Allowed ? AuthorizationResult.Success() : AuthorizationResult.Failed());
        }
        public Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user, object? resource, IEnumerable<IAuthorizationRequirement> requirements) =>
            throw new NotSupportedException();
    }
}
