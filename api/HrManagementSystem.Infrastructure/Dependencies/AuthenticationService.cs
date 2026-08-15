using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Domain.Tenancy.Enums;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class AuthenticationService
{
    public static IServiceCollection AddAuthenticationService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<AuthLoginService>();
        services.AddScoped<AuthSessionService>();
        services.AddScoped<AuthAccountService>();
        services.AddScoped<AuthCompanyAccessService>();
        services.AddScoped<RegistrationProfilePictureStore>();
        services.AddScoped<SessionRevocationNotifier>();
        services.AddScoped<IJwtProvider, JwtProvider>();
        services.AddScoped<IAuthEmailService, AuthEmailService>();
        services.AddScoped<ILoginAuditService, LoginAuditService>();
        services.AddOptions<AppSettings>()
            .BindConfiguration(nameof(AppSettings))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddTransient<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
        services.AddTransient<IAuthorizationHandler, PermissionAuthorizationHandler>();

        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        services.AddOptions<JwtOptions>()
            .BindConfiguration(nameof(JwtOptions))
            .PostConfigure(options => ApplyDevelopmentDefaults(options, configuration))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var jwtOptions = configuration
            .GetSection(nameof(JwtOptions))
            .Get<JwtOptions>()
            ?? throw new InvalidOperationException("JWT configuration is missing.");

        ApplyDevelopmentDefaults(jwtOptions, configuration);
        Validator.ValidateObject(jwtOptions, new ValidationContext(jwtOptions), validateAllProperties: true);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.TokenValidationParameters = JwtProvider.CreateValidationParameters(
                jwtOptions,
                jwtOptions.Audience);
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = ValidateSessionAsync
            };
        })
        .AddJwtBearer(JwtAuthenticationSchemes.Realtime, options =>
        {
            options.TokenValidationParameters = JwtProvider.CreateValidationParameters(
                jwtOptions,
                jwtOptions.RealtimeAudience);
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
                OnTokenValidated = ValidateSessionAsync
            };
        });

        services.AddAuthorizationBuilder()
            .AddPolicy(
                TenantMemberAttribute.PolicyName,
                policy => policy
                    .RequireAuthenticatedUser()
                    .RequireAssertion(context =>
                        !context.User.IsInRole(AppRoles.super_admin) &&
                        (context.User.IsInRole(AppRoles.admin) ||
                         context.User.IsInRole(AppRoles.user))))
            .SetFallbackPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());

        return services;
    }

    private static void ApplyDevelopmentDefaults(JwtOptions options, IConfiguration configuration)
    {
        if (!IsDevelopment(configuration) || !string.IsNullOrWhiteSpace(options.Key))
            return;

        options.Key = "HrManagementSystem-Development-Only-Jwt-Key-Replace-With-User-Secrets";
    }

    private static bool IsDevelopment(IConfiguration configuration)
    {
        var environmentName = configuration["ASPNETCORE_ENVIRONMENT"]
            ?? configuration["DOTNET_ENVIRONMENT"];

        return string.Equals(environmentName, Environments.Development, StringComparison.OrdinalIgnoreCase);
    }

    private static async Task ValidateSessionAsync(TokenValidatedContext context)
    {
        var principal = context.Principal;
        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        var sessionId = principal?.FindFirstValue(JwtClaimNames.SessionId);
        var securityStamp = principal?.FindFirstValue(JwtClaimNames.SecurityStamp);
        var tenantId = principal?.FindFirstValue(JwtClaimNames.TenantId);
        var companyIdValue = principal?.FindFirstValue(JwtClaimNames.CompanyId);

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

        var now = DateTime.UtcNow;
        var database = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
        var state = await database.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new
            {
                user.IsDisabled,
                user.LockoutEnd,
                user.SecurityStamp,
                HasTenantAccess = database.UserTenantAccesses
                    .IgnoreQueryFilters()
                    .Any(access =>
                        access.UserId == userId &&
                        access.TenantId == tenantId),
                HasActiveSession = user.RefreshTokens.Any(token =>
                    token.SessionId == sessionId &&
                    token.CompanyId == companyId &&
                    token.RevokedOn == null &&
                    token.ExpiresOn > now),
                HasCompanyAccess = database.UserCompanyAccesses
                    .IgnoreQueryFilters()
                    .Any(access =>
                        access.UserId == userId &&
                        access.TenantId == tenantId &&
                        access.CompanyId == companyId &&
                        access.Company.IsActive),
                IsTenantActive = database.Tenants.Any(tenant =>
                    tenant.Id == tenantId &&
                    tenant.IsActive &&
                    tenant.SubscriptionStatus != SubscriptionStatus.Suspended &&
                    tenant.SubscriptionStatus != SubscriptionStatus.Cancelled)
            })
            .SingleOrDefaultAsync(context.HttpContext.RequestAborted);

        if (state is null ||
            state.IsDisabled ||
            state.LockoutEnd > DateTimeOffset.UtcNow ||
            !string.Equals(state.SecurityStamp, securityStamp, StringComparison.Ordinal) ||
            !state.HasTenantAccess ||
            !state.IsTenantActive ||
            !state.HasCompanyAccess ||
            !state.HasActiveSession)
        {
            context.Fail("The session is no longer active.");
        }
    }
}
