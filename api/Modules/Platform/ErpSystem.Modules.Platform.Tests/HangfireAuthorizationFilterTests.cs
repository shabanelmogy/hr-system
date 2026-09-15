using System.Security.Claims;
using ErpSystem.Modules.Platform.Infrastructure.Hangfire;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformHangfireAuthorizationFilterTests
{
    [Fact]
    public void Authorize_AllowsAuthenticatedUserWithPermissionOnAllowedHost()
    {
        var filter = CreateFilter("localhost");
        var context = CreateContext(
            host: "LOCALHOST",
            authenticated: true,
            permissions: [PlatformPermissions.ViewHangfireDashboard]);

        Assert.True(filter.Authorize(context));
    }

    [Theory]
    [InlineData("/hangfire/css123")]
    [InlineData("/hangfire/css-dark123")]
    [InlineData("/hangfire/js123")]
    [InlineData("/hangfire/fonts/glyphicons-halflings-regular/woff2")]
    public void Authorize_AllowsStaticDashboardAssetsWithoutUser(string path)
    {
        var filter = CreateFilter("localhost");
        var context = CreateContext(
            host: "untrusted.example",
            authenticated: false,
            permissions: [],
            path: path);

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
            ? new[] { PlatformPermissions.ViewHangfireDashboard }
            : Array.Empty<string>();
        var context = CreateContext(host, authenticated, permissions);

        Assert.False(filter.Authorize(context));
    }

    private static PlatformHangfireAuthorizationFilter CreateFilter(params string[] allowedHosts) =>
        new(Options.Create(new PlatformHangfireSettings
        {
            AllowedHosts = [.. allowedHosts]
        }));

    private static DefaultHttpContext CreateContext(
        string host,
        bool authenticated,
        IEnumerable<string> permissions,
        string? path = null)
    {
        var claims = permissions.Select(permission =>
            new Claim(PermissionClaimNames.Permission, permission));
        var identity = new ClaimsIdentity(
            claims,
            authenticated ? "TestAuthentication" : null);
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity)
        };
        context.Request.Host = new HostString(host);
        if (path is not null) context.Request.Path = path;
        return context;
    }
}

