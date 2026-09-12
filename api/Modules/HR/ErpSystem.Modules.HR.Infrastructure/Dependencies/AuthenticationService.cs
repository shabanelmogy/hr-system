using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Users.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Invitations.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.HR.Infrastructure.Hangfire;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.SessionValidation;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class AuthenticationService
{
    public static IServiceCollection AddAuthenticationService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<AuthLoginService>();
        services.AddScoped<AuthSessionService>();
        services.AddScoped<AuthAccountService>();
        services.AddScoped<IAuthenticationLoginAdapter, LegacyHrIdentityLoginAdapter>();
        services.AddScoped<IAuthenticationSessionAdapter, LegacyHrIdentitySessionAdapter>();
        services.AddScoped<IAuthenticationAccountAdapter, LegacyHrIdentityAccountAdapter>();
        services.AddScoped<IAuthLoginService, PlatformAuthenticationLoginCompatibilityService>();
        services.AddScoped<IAuthSessionService, PlatformAuthenticationSessionCompatibilityService>();
        services.AddScoped<IAuthAccountService, PlatformAuthenticationAccountCompatibilityService>();
        services.AddScoped<IUserInvitationService, UserInvitationService>();
        services.AddScoped<IUserSeatLimitService, UserSeatLimitService>();
        services.AddScoped<TenantRoleAssignmentService>();
        services.AddScoped<AuthCompanyAccessService>();
        services.AddScoped<AuthEmailLinkBuilder>();
        services.AddScoped<RegistrationProfilePictureStore>();
        services.AddScoped<SessionRevocationNotifier>();
        // Register the concrete provider once per request so both contracts share
        // the same scoped instance. IRealtimeTokenProvider resolves the concrete
        // type directly, therefore registering only IJwtProvider is insufficient.
        services.AddScoped<JwtProvider>();
        services.AddScoped<IJwtProvider>(provider =>
            provider.GetRequiredService<JwtProvider>());
        services.AddScoped<IRealtimeTokenProvider>(provider =>
            provider.GetRequiredService<JwtProvider>());
        services.AddScoped<RealtimePrincipalClaimsLoader>();
        services.AddScoped<IAuthEmailService, AuthEmailService>();
        services.AddScoped<ILoginAuditService, LoginAuditService>();
        services.AddOptions<InvitationSettings>()
            .BindConfiguration(InvitationSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddOptions<AppSettings>()
            .BindConfiguration(nameof(AppSettings))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        services.RemoveAll<IRoleValidator<ApplicationRole>>();
        services.AddScoped<IRoleValidator<ApplicationRole>, TenantRoleValidator>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (HangfireSessionAuthentication.TryGetAccessToken(
                            context.Request,
                            out var accessToken))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                },
                OnTokenValidated = ValidateSessionAsync
            };
        })
        .AddJwtBearer(JwtAuthenticationSchemes.Realtime, options =>
        {
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    if (!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/hubs"))
                        context.Token = accessToken;

                    return Task.CompletedTask;
                },
                OnTokenValidated = ValidateRealtimeSessionAsync
            };
        });

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IAuthenticationTokenValidationParametersFactory>((options, factory) =>
                options.TokenValidationParameters = factory.Create(factory.Audience));
        services.AddOptions<JwtBearerOptions>(JwtAuthenticationSchemes.Realtime)
            .Configure<IAuthenticationTokenValidationParametersFactory>((options, factory) =>
                options.TokenValidationParameters = factory.Create(factory.RealtimeAudience));

        return services;
    }

    private static async Task ValidateSessionAsync(TokenValidatedContext context)
    {
        var principal = context.Principal;
        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        var sessionId = principal?.FindFirstValue(AuthenticationTokenClaimNames.SessionId);
        var securityStamp = principal?.FindFirstValue(AuthenticationTokenClaimNames.SecurityStamp);
        var tenantId = principal?.FindFirstValue(AuthenticationTokenClaimNames.TenantId);
        var companyIdValue = principal?.FindFirstValue(AuthenticationTokenClaimNames.CompanyId);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(sessionId) ||
            string.IsNullOrWhiteSpace(securityStamp) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            !int.TryParse(companyIdValue, out var companyId) ||
            companyId <= 0)
        {
            context.Fail("The token is missing required session claims.");
            return;
        }

        var validationService = context.HttpContext.RequestServices
            .GetRequiredService<ISessionValidationService>();
        var validation = await validationService.ValidateAsync(
            new SessionValidationRequest(
                userId,
                sessionId,
                securityStamp,
                tenantId,
                companyId),
            context.HttpContext.RequestAborted);

        if (!validation.IsValid)
        {
            context.Fail("The session is no longer active.");
        }
    }

    private static async Task ValidateRealtimeSessionAsync(TokenValidatedContext context)
    {
        await ValidateSessionAsync(context);
        if (context.Result?.Succeeded == false)
            return;

        var principal = context.Principal;
        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = principal?.FindFirstValue(AuthenticationTokenClaimNames.TenantId);
        if (principal is null || string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(tenantId))
        {
            context.Fail("The realtime token is missing required authorization context.");
            return;
        }

        var loader = context.HttpContext.RequestServices
            .GetRequiredService<RealtimePrincipalClaimsLoader>();
        await loader.LoadAsync(
            principal,
            userId,
            tenantId,
            context.HttpContext.RequestAborted);
    }
}
