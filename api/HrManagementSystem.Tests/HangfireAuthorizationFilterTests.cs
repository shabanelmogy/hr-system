using System.Security.Claims;
using HrManagementSystem.Infrastructure.Hangfire.Filters;
using HrManagementSystem.Shared.Consts;
using HrManagementSystem.Shared.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

public sealed class HangfireAuthorizationFilterTests
{
    [Fact]
    public void Authorize_AllowsAuthenticatedUserWithPermissionOnAllowedHost()
    {
        var filter = CreateFilter("localhost");
        var context = CreateContext(
            host: "LOCALHOST",
            authenticated: true,
            permissions: [Permissions.ViewHangfireDashboard]);

        Assert.True(filter.Authorize(context));
    }

    [Theory]
    [InlineData(false, true, "localhost")]
    [InlineData(true, false, "localhost")]
    [InlineData(true, true, "untrusted.example")]
    public void Authorize_DeniesRequestsMissingAnyRequiredCondition(
        bool authenticated,
        bool hasPermission,
        string host)
    {
        var filter = CreateFilter("localhost");
        var permissions = hasPermission
            ? new[] { Permissions.ViewHangfireDashboard }
            : Array.Empty<string>();
        var context = CreateContext(host, authenticated, permissions);

        Assert.False(filter.Authorize(context));
    }

    private static HangfireAuthorizationFilter CreateFilter(params string[] allowedHosts) =>
        new(Options.Create(new HangfireSettings
        {
            AllowedHosts = [.. allowedHosts]
        }));

    private static DefaultHttpContext CreateContext(
        string host,
        bool authenticated,
        IEnumerable<string> permissions)
    {
        var claims = permissions.Select(permission =>
            new Claim(Permissions.Type, permission));
        var identity = new ClaimsIdentity(
            claims,
            authenticated ? "TestAuthentication" : null);
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity)
        };
        context.Request.Host = new HostString(host);
        return context;
    }
}
