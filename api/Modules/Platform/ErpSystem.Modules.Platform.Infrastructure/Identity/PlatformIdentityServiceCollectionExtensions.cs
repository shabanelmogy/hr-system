using System.Security.Claims;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Browser;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

public static class PlatformIdentityServiceCollectionExtensions
{
    public static IServiceCollection AddPlatformIdentity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        var corsOrigins = configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? [];
        services.AddOptions<BrowserAuthenticationOptions>()
            .BindConfiguration(BrowserAuthenticationOptions.SectionName)
            .Validate(options => options.AllowedOrigins.All(origin =>
                Uri.TryCreate(origin, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps &&
                uri.GetLeftPart(UriPartial.Authority) == origin && corsOrigins.Contains(origin, StringComparer.Ordinal)),
                "BrowserAuthentication:AllowedOrigins must be exact HTTPS origins also listed in CorsSettings:AllowedOrigins.")
            .ValidateOnStart();
        services.AddScoped<BrowserAuthenticationCookies>();
        services.AddScoped<IBrowserAuthenticationCookies>(provider => provider.GetRequiredService<BrowserAuthenticationCookies>());
        services.AddScoped<IAuthenticationSessionIssuanceGuard>(provider => provider.GetRequiredService<BrowserAuthenticationCookies>());
        // Preserve the shared ASP.NET Cookie/header contract used by Hangfire/Next.
        // BrowserAntiforgery maps its own transport pair onto this framework service.
        services.AddAntiforgery();
        services.AddIdentity<PlatformApplicationUser, PlatformApplicationRole>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.SignIn.RequireConfirmedEmail = true;
                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<PlatformDbContext>()
            .AddDefaultTokenProviders();

        services.AddScoped<PlatformIdentitySessionAdapter>();
        services.AddScoped<IAuthenticationLoginAdapter, PlatformIdentityLoginAdapter>();
        services.AddScoped<IAuthenticationSessionAdapter>(provider =>
            provider.GetRequiredService<PlatformIdentitySessionAdapter>());
        services.AddScoped<IAuthenticationAccountAdapter, PlatformIdentityAccountAdapter>();
        services.AddScoped<IPlatformIdentityEmailSender, PlatformIdentityEmailSender>();

        services.AddOptions<PlatformMailSettings>()
            .BindConfiguration(PlatformMailSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddOptions<PlatformPublicApplicationSettings>()
            .BindConfiguration(PlatformPublicApplicationSettings.SectionName)
            .ValidateDataAnnotations()
            .Validate(
                options => IsFrontendUrlValidWhenMailEnabled(options, configuration),
                "AppSettings:FrontendUrl must be a non-empty absolute HTTP or HTTPS URL when mail delivery is enabled.")
            .ValidateOnStart();

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var browserEndpoint = context.HttpContext.GetEndpoint()?.Metadata.GetMetadata<BrowserAuthenticationEndpointAttribute>() is not null;
                        if (browserEndpoint) MarkPrivateResponse(context.HttpContext);
                        if (context.Request.Headers.ContainsKey("Authorization"))
                        {
                            if (browserEndpoint) context.Fail("Browser endpoints do not accept Authorization headers.");
                            return Task.CompletedTask;
                        }
                        if (context.HttpContext.GetEndpoint()?.Metadata.GetMetadata<BearerOnlyAuthenticationAttribute>() is not null ||
                            context.Request.Path.StartsWithSegments(Hangfire.PlatformHangfireSettings.DashboardPath) ||
                            context.Request.Path.StartsWithSegments("/hubs"))
                            return Task.CompletedTask;
                        if (context.HttpContext.RequestServices.GetRequiredService<IOptions<BrowserAuthenticationOptions>>().Value.AllowedOrigins.Count == 0)
                            return Task.CompletedTask;
                        try
                        {
                            var material = context.HttpContext.RequestServices.GetRequiredService<IBrowserAuthenticationCookies>().Read();
                            if (!string.IsNullOrEmpty(material.Token))
                            {
                                context.Token = material.Token;
                                context.HttpContext.Items[BrowserAuthenticationDefaults.CookieAuthenticationItem] = true;
                            }
                        }
                        catch (FormatException) { context.Fail("Browser session Cookies are malformed."); }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = ValidateSessionAsync
                })
            .AddJwtBearer(AuthenticationSchemes.Realtime, options =>
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var token = context.Request.Query["access_token"];
                        if (!string.IsNullOrWhiteSpace(token) && context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                            context.Token = token;
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = ValidateSessionAsync
                });

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IAuthenticationTokenValidationParametersFactory>((options, factory) =>
                options.TokenValidationParameters = factory.Create(factory.Audience));
        services.AddOptions<JwtBearerOptions>(AuthenticationSchemes.Realtime)
            .Configure<IAuthenticationTokenValidationParametersFactory>((options, factory) =>
                options.TokenValidationParameters = factory.Create(factory.RealtimeAudience));

        return services;
    }

    private static bool IsFrontendUrlValidWhenMailEnabled(
        PlatformPublicApplicationSettings options,
        IConfiguration configuration)
    {
        if (!configuration.GetValue<bool>($"{PlatformMailSettings.SectionName}:Enabled"))
            return true;

        return Uri.TryCreate(options.FrontendUrl, UriKind.Absolute, out var uri) &&
            (string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase));
    }

    private static async Task ValidateSessionAsync(TokenValidatedContext context)
    {
        var principal = context.Principal;
        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        var sessionId = principal?.FindFirstValue(AuthenticationTokenClaimNames.SessionId);
        var securityStamp = principal?.FindFirstValue(AuthenticationTokenClaimNames.SecurityStamp);
        var tenantId = principal?.FindFirstValue(AuthenticationTokenClaimNames.TenantId);
        var companyValue = principal?.FindFirstValue(AuthenticationTokenClaimNames.CompanyId);
        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(sessionId) ||
            string.IsNullOrWhiteSpace(securityStamp) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            !int.TryParse(companyValue, out var companyId) ||
            companyId <= 0)
        {
            context.Fail("The token is missing required SaaS scope claims.");
            return;
        }

        var validation = await context.HttpContext.RequestServices
            .GetRequiredService<ISessionValidationService>()
            .ValidateAsync(new SessionValidationRequest(
                userId,
                sessionId,
                securityStamp,
                tenantId,
                companyId), context.HttpContext.RequestAborted);
        if (!validation.IsValid)
            context.Fail("The session or SaaS scope is no longer active.");
        else if (context.HttpContext.Items.ContainsKey(BrowserAuthenticationDefaults.CookieAuthenticationItem))
            MarkPrivateResponse(context.HttpContext);
    }

    private static void MarkPrivateResponse(HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store, private";
        context.Response.OnStarting(() =>
        {
            context.Response.Headers.CacheControl = "no-store, private";
            return Task.CompletedTask;
        });
    }

    internal static class AuthenticationSchemes
    {
        public const string Realtime = "RealtimeBearer";
    }
}
