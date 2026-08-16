using HrManagementSystem.Infrastructure.Common.Settings;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

public sealed class AuthEmailLinkBuilderTests
{
    [Fact]
    public void ConfirmationLink_UsesSharedRouteAndUrlEncodesParameters()
    {
        var links = CreateBuilder("https://app.example.com/");

        var uri = new Uri(links.BuildConfirmationLink("user/id", "token+/="));
        var query = QueryHelpers.ParseQuery(uri.Query);

        Assert.Equal("https", uri.Scheme);
        Assert.Equal("app.example.com", uri.Host);
        Assert.Equal("/confirm-email", uri.AbsolutePath);
        Assert.Equal("user/id", query["userId"]);
        Assert.Equal("token+/=", query["code"]);
    }

    [Fact]
    public void ResetPasswordLink_UsesConfiguredBasePath()
    {
        var links = CreateBuilder("https://app.example.com/hr/");

        var uri = new Uri(links.BuildResetPasswordLink("user@example.com", "code"));

        Assert.Equal("/hr/reset-password", uri.AbsolutePath);
    }

    [Fact]
    public void InvitationActivationLink_UsesSharedHttpsBaseUrlAndEncodesToken()
    {
        var invitationId = Guid.NewGuid();
        var links = CreateBuilder("https://app.example.com/");

        var uri = new Uri(links.BuildInvitationActivationLink(invitationId, "token+/="));
        var query = QueryHelpers.ParseQuery(uri.Query);

        Assert.Equal("https", uri.Scheme);
        Assert.Equal("/accept-invitation", uri.AbsolutePath);
        Assert.Equal(invitationId.ToString("D"), query["invitationId"]);
        Assert.Equal("token+/=", query["token"]);
    }

    private static AuthEmailLinkBuilder CreateBuilder(string publicAppUrl) =>
        new(Options.Create(new AppSettings { FrontendUrl = publicAppUrl }));
}
