using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Browser;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using ErpSystem.Modules.Platform.Presentation.Authentication;
using Microsoft.AspNetCore.Builder;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class HangfireBrowserAuthenticationTests
{
    [Theory]
    [InlineData("/hangfire/stats", "https://api.fixture.invalid", true, 204)]
    [InlineData("/hangfire/jobs/enqueued", "https://localhost:4210", true, 204)]
    [InlineData("/hangfire/stats", "https://api.fixture.invalid", false, 400)]
    [InlineData("/hangfire/stats", "https://evil.invalid", true, 403)]
    [InlineData("/hangfire/stats", "", true, 403)]
    [InlineData("/api/v1/example", "https://api.fixture.invalid", true, 403)]
    [InlineData("/api/v1/example", "https://localhost:4210", true, 400)]
    public async Task CookieMutations_RequireTrustedOrigin_AndTheOwningAntiforgeryPair(string path, string origin, bool validToken, int status)
    {
        using var provider = Provider(crossSite: true);
        var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "fixture")], "fixture"));
        var mint = new DefaultHttpContext { RequestServices = provider, User = principal };
        mint.Request.Scheme = "https";
        var antiforgery = provider.GetRequiredService<IAntiforgery>();
        var pair = antiforgery.GetTokens(mint);
        var context = new DefaultHttpContext { RequestServices = provider, User = principal };
        context.Request.Method = "POST";
        context.Request.Path = path;
        context.Request.Scheme = "https";
        context.Request.Host = new HostString("api.fixture.invalid");
        context.Request.Headers.Origin = origin;
        context.Request.Headers.Cookie = provider.GetRequiredService<IOptions<AntiforgeryOptions>>().Value.Cookie.Name + "=" + pair.CookieToken;
        if (validToken) context.Request.Headers[pair.HeaderName!] = pair.RequestToken;
        context.Items[BrowserAuthenticationDefaults.CookieAuthenticationItem] = true;
        context.Response.Body = new MemoryStream();
        var bridge = new BrowserAntiforgery(antiforgery, provider.GetRequiredService<IBrowserAuthenticationCookies>(),
            provider.GetRequiredService<IAuthenticationTokenValidationParametersFactory>(), provider.GetRequiredService<IOptions<AntiforgeryOptions>>());
        var middleware = new BrowserAuthenticationMiddleware(ctx => { ctx.Response.StatusCode = 204; return Task.CompletedTask; });
        await middleware.InvokeAsync(context, provider.GetRequiredService<IOptions<BrowserAuthenticationOptions>>(), bridge);
        Assert.Equal(status, context.Response.StatusCode);
    }

    [Fact]
    public async Task HangfireFramePolicy_RestrictsAncestors_AndPreservesOtherCspAndOtherRoutes()
    {
        using var provider = Provider(crossSite: true);
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddSingleton(provider.GetRequiredService<IOptions<BrowserAuthenticationOptions>>());
        builder.Services.AddSingleton(new BrowserAntiforgery(provider.GetRequiredService<IAntiforgery>(), provider.GetRequiredService<IBrowserAuthenticationCookies>(),
            provider.GetRequiredService<IAuthenticationTokenValidationParametersFactory>(), provider.GetRequiredService<IOptions<AntiforgeryOptions>>()));
        await using var app = builder.Build();
        app.Urls.Add("http://127.0.0.1:0");
        app.UseMiddleware<BrowserAuthenticationMiddleware>();
        app.Run(context => {
            context.Response.Headers.XFrameOptions = "SAMEORIGIN";
            context.Response.Headers.ContentSecurityPolicy = "default-src 'self'; frame-ancestors 'none'; script-src 'self'";
            return context.Response.WriteAsync("fixture");
        });
        await app.StartAsync();
        try
        {
            using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
            using var dashboard = await client.GetAsync("/hangfire");
            Assert.False(dashboard.Headers.Contains("X-Frame-Options"));
            var csp = Assert.Single(dashboard.Headers.GetValues("Content-Security-Policy"));
            Assert.Contains("frame-ancestors 'self' https://localhost:4210", csp, StringComparison.Ordinal);
            Assert.Contains("script-src 'self'", csp, StringComparison.Ordinal);
            Assert.DoesNotContain("'none'", csp, StringComparison.Ordinal);
            using var other = await client.GetAsync("/api/v1/example");
            Assert.Equal("SAMEORIGIN", Assert.Single(other.Headers.GetValues("X-Frame-Options")));
            Assert.Contains("frame-ancestors 'none'", Assert.Single(other.Headers.GetValues("Content-Security-Policy")), StringComparison.Ordinal);
        }
        finally { await app.StopAsync(); }
    }

    [Theory]
    [InlineData("/hangfire", true)]
    [InlineData("/hangfire/jobs/failed", true)]
    [InlineData("/hangfire/stats", true)]
    [InlineData("/hubs/company", false)]
    public async Task BrowserCookie_IsAvailableToHangfire_ButNotRealtime(string path, bool expected)
    {
        using var provider = Provider(crossSite: true);
        var context = new DefaultHttpContext { RequestServices = provider };
        provider.GetRequiredService<IHttpContextAccessor>().HttpContext = context;
        context.Request.Path = path;
        context.Request.Headers.Cookie = BrowserAuthenticationDefaults.AccessCookie + "=synthetic";
        var options = provider.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>().Get(JwtBearerDefaults.AuthenticationScheme);
        var received = new MessageReceivedContext(context, new AuthenticationScheme("Bearer", null, typeof(JwtBearerHandler)), options);
        await options.Events.OnMessageReceived(received);
        Assert.Equal(expected ? "synthetic" : null, received.Token);
        Assert.Equal(expected, context.Items.ContainsKey(BrowserAuthenticationDefaults.CookieAuthenticationItem));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void NativeAntiforgery_PreservesNamesAndSecurity_AndAllowsExplicitCrossSiteEmbedding(bool crossSite)
    {
        using var provider = Provider(crossSite);
        var options = provider.GetRequiredService<IOptions<AntiforgeryOptions>>().Value;
        Assert.StartsWith(".AspNetCore.Antiforgery.", options.Cookie.Name, StringComparison.Ordinal);
        Assert.Equal("RequestVerificationToken", options.HeaderName);
        Assert.True(options.Cookie.HttpOnly);
        Assert.False(options.SuppressXFrameOptionsHeader);
        Assert.Equal(crossSite ? SameSiteMode.None : SameSiteMode.Strict, options.Cookie.SameSite);
        if (crossSite) Assert.Equal(CookieSecurePolicy.Always, options.Cookie.SecurePolicy);
    }

    private static ServiceProvider Provider(bool crossSite)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["CorsSettings:AllowedOrigins:0"] = "https://localhost:4210",
            ["BrowserAuthentication:AllowedOrigins:0"] = "https://localhost:4210",
            ["BrowserAuthentication:UseCrossSiteCookies"] = crossSite.ToString()
        }).Build();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<IConfiguration>(config);
        services.AddSingleton<IAuthenticationTokenValidationParametersFactory>(new JwtAuthenticationTokenValidationParametersFactory(
            new AuthenticationTokenOptions { Key = new string('a', 64), Audience = "fixture", Issuer = "fixture" }));
        services.AddPlatformIdentity(config);
        return services.BuildServiceProvider();
    }
}
