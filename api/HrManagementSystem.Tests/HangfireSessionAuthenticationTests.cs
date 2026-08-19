using HrManagementSystem.Infrastructure.Hangfire;
using Microsoft.AspNetCore.Http;

namespace HrManagementSystem.Tests;

public sealed class HangfireSessionAuthenticationTests
{
    [Fact]
    public void TryGetAccessToken_ReturnsCookieForHangfireRequests()
    {
        var context = new DefaultHttpContext();
        context.Request.Path = "/hangfire/jobs/enqueued";
        context.Request.Headers.Cookie =
            $"{HangfireSessionAuthentication.CookieName}=test-access-token";

        var found = HangfireSessionAuthentication.TryGetAccessToken(
            context.Request,
            out var accessToken);

        Assert.True(found);
        Assert.Equal("test-access-token", accessToken);
    }

    [Theory]
    [InlineData("/")]
    [InlineData("/api/v1/backgroundJobs/getDashboard")]
    [InlineData("/hangfire-other")]
    public void TryGetAccessToken_RejectsCookieOutsideHangfirePath(string path)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Headers.Cookie =
            $"{HangfireSessionAuthentication.CookieName}=test-access-token";

        var found = HangfireSessionAuthentication.TryGetAccessToken(
            context.Request,
            out var accessToken);

        Assert.False(found);
        Assert.Empty(accessToken);
    }

    [Fact]
    public void WriteAccessTokenCookie_ChunksAndReassemblesLargeTokens()
    {
        var token = new string('a', 12_000);
        var responseContext = new DefaultHttpContext();

        HangfireSessionAuthentication.WriteAccessTokenCookie(
            responseContext,
            token,
            DateTimeOffset.UtcNow.AddMinutes(10));

        var setCookies = responseContext.Response.Headers.SetCookie;
        Assert.True(setCookies.Count > 1);

        var requestContext = new DefaultHttpContext();
        requestContext.Request.Path = "/hangfire";
        requestContext.Request.Headers.Cookie = string.Join(
            "; ",
            setCookies.Select(value =>
            {
                var cookie = value ?? throw new InvalidOperationException("Set-Cookie value is missing.");
                return cookie[..cookie.IndexOf(';')];
            }));

        var found = HangfireSessionAuthentication.TryGetAccessToken(
            requestContext.Request,
            out var accessToken);

        Assert.True(found);
        Assert.Equal(token, accessToken);
    }
}
