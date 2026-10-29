using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.Authentication.Browser;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class BrowserAuthenticationCookieTests
{
    [Theory]
    [InlineData("__Host-erp-angular-access=chunks-6")]
    [InlineData("__Host-erp-angular-access=chunks-02; __Host-erp-angular-accessC1=a; __Host-erp-angular-accessC2=b")]
    [InlineData("__Host-erp-angular-access=chunks-2; __Host-erp-angular-accessC1=a")]
    [InlineData("__Host-erp-angular-access=valid; __Host-erp-angular-accessC1=extra")]
    [InlineData("__Host-erp-angular-accessC1=orphan")]
    [InlineData("__Host-erp-angular-access=valid; __Host-erp-angular-access=duplicate")]
    [InlineData("__Host-erp-angular-access=chunks-1; __Host-erp-angular-accessC1=valid; __Host-erp-angular-accessC2=extra")]
    [InlineData("__Host-erp-angular-refresh=bad/material")]
    public void Read_RejectsMalformedPartialExtraAndDuplicateMaterial(string header)
    {
        var context = new DefaultHttpContext(); context.Request.Headers.Cookie = header;
        var cookies = new BrowserAuthenticationCookies(new HttpContextAccessor { HttpContext = context });
        Assert.Throws<FormatException>(() => cookies.Read());
    }

    [Fact]
    public void Read_RejectsOversizeBeforeChunkAssembly_AndDoesNotReadNextCookies()
    {
        var context = new DefaultHttpContext();
        var cookies = new BrowserAuthenticationCookies(new HttpContextAccessor { HttpContext = context });
        context.Request.Headers.Cookie = "__Host-erp-angular-access=" + new string('x', BrowserAuthenticationDefaults.MaximumCookieHeaderBytes + 1);
        Assert.Throws<FormatException>(() => cookies.Read());
        context.Request.Headers.Cookie = "__Host-next-access=next-secret; __Host-next-refresh=next-refresh";
        Assert.Null(cookies.Read().Token);
        Assert.Empty(cookies.Read().RefreshToken);
    }

    [Fact]
    public void Write_RoundTripsMaximumBoundedChunks_RetainsPairedExpiry_AndClearsOnlyOwnedNames()
    {
        var output = new DefaultHttpContext();
        output.Request.Headers.Cookie = "__Host-next-access=retained; __Host-erp-angular-accessC5=stale";
        var cookies = new BrowserAuthenticationCookies(new HttpContextAccessor { HttpContext = output });
        var expires = DateTime.UtcNow.AddDays(3);
        var token = new string('a', BrowserAuthenticationDefaults.MaximumAccessBytes);
        cookies.Write(new AuthenticationSessionResponse("user", "user", "First", "Last", "tenant", "Tenant", "Plan", 1,
            "C", "شركة", "Company", token, DateTime.UtcNow.AddMinutes(10), "refresh-material", expires));
        var headers = output.Response.Headers.SetCookie.Select(value => value!).ToArray();
        Assert.DoesNotContain(headers, header => header.StartsWith("__Host-next", StringComparison.Ordinal));
        var assignments = headers.Select(header => header.Split(';', 2)[0]).GroupBy(header => header.Split('=', 2)[0])
            .Select(group => group.Last()).Where(header => !header.EndsWith('=')).ToArray();
        var input = new DefaultHttpContext(); input.Request.Headers.Cookie = string.Join("; ", assignments);
        var received = new BrowserAuthenticationCookies(new HttpContextAccessor { HttpContext = input }).Read();
        Assert.Equal(token, received.Token);
        Assert.Equal("refresh-material", received.RefreshToken);
        Assert.Equal(6, assignments.Count(value => value.StartsWith(BrowserAuthenticationDefaults.AccessCookie, StringComparison.Ordinal)));
        Assert.All(headers.Where(header => !header.Contains("1970", StringComparison.Ordinal)), header =>
        {
            Assert.Contains("secure", header, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("httponly", header, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("samesite=lax", header, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("domain=", header, StringComparison.OrdinalIgnoreCase);
        });
    }

    [Fact]
    public void Admission_BoundsBrowserIssuanceBeforeCommit_AndRetainsBearerContract()
    {
        var context = new DefaultHttpContext();
        var guard = new BrowserAuthenticationCookies(new HttpContextAccessor { HttpContext = context });
        var oversized = new string('a', BrowserAuthenticationDefaults.MaximumAccessBytes + 1);
        Assert.Null(guard.Validate(oversized, DateTime.UtcNow.AddDays(1)));
        context.SetEndpoint(new Endpoint(_ => Task.CompletedTask, new EndpointMetadataCollection(new BrowserAuthenticationEndpointAttribute()), "browser"));
        Assert.Equal("Authentication.BrowserSessionTooLarge", guard.Validate(oversized, DateTime.UtcNow.AddDays(1))!.Code);
        Assert.Null(guard.Validate(new string('a', BrowserAuthenticationDefaults.MaximumAccessBytes), DateTime.UtcNow.AddDays(1)));
        Assert.Equal(0, context.Response.Headers.SetCookie.Count);
    }

    [Theory]
    [InlineData("http://localhost:4210")]
    [InlineData("https://localhost:4210/path")]
    [InlineData("https://localhost:4210/")]
    [InlineData("https://unapproved.invalid")]
    [InlineData("*")]
    public void Configuration_RejectsInsecureNonOriginAndUnapprovedCorsValues(string origin)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["CorsSettings:AllowedOrigins:0"] = "https://localhost:4210",
            ["BrowserAuthentication:AllowedOrigins:0"] = origin
        }).Build();
        var services = new ServiceCollection(); services.AddLogging(); services.AddSingleton<IConfiguration>(config); services.AddPlatformIdentity(config);
        using var provider = services.BuildServiceProvider();
        Assert.Throws<OptionsValidationException>(() => provider.GetRequiredService<IOptions<BrowserAuthenticationOptions>>().Value);
    }

    [Fact]
    public void Registration_PreservesGlobalHangfireAntiforgeryCookieAndHeader()
    {
        var config = new ConfigurationBuilder().Build();
        var services = new ServiceCollection(); services.AddLogging(); services.AddSingleton<IConfiguration>(config); services.AddPlatformIdentity(config);
        using var provider = services.BuildServiceProvider();
        var options = provider.GetRequiredService<IOptions<AntiforgeryOptions>>().Value;
        Assert.StartsWith(".AspNetCore.Antiforgery.", options.Cookie.Name, StringComparison.Ordinal);
        Assert.Equal("RequestVerificationToken", options.HeaderName);
    }
}
