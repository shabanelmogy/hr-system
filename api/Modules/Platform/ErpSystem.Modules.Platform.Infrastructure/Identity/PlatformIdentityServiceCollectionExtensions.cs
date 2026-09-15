using System.Security.Claims;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

internal static class PlatformIdentityServiceCollectionExtensions
{
    public static IServiceCollection AddPlatformIdentity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
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
    }

    internal static class AuthenticationSchemes
    {
        public const string Realtime = "RealtimeBearer";
    }
}
