using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.OfflineOperations;
using ErpSystem.Modules.Platform.Contracts.SessionValidation;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.OfflineOperations;
using ErpSystem.Modules.Platform.Infrastructure.Persistence.LegacyHr;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Infrastructure;

public static class DependencyInjection
{
    internal const string DevelopmentSigningKey =
        "HrManagementSystem-Development-Only-Jwt-Key-Replace-With-User-Secrets";

    public static IServiceCollection AddPlatformInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Platform")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'Platform' or 'DefaultConnection' not found.");

        services.AddDbContext<PlatformDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)));

        services.AddScoped<IOfflineOperationsPolicyStore, OfflineOperationsPolicyStore>();

        services.AddScoped<LegacyHrPlatformSource>();
        services.AddScoped<ITenantAccessSource>(provider =>
            provider.GetRequiredService<LegacyHrPlatformSource>());
        services.AddScoped<ITenantMembershipSource>(provider =>
            provider.GetRequiredService<LegacyHrPlatformSource>());
        services.AddScoped<ICompanyAccessSource>(provider =>
            provider.GetRequiredService<LegacyHrPlatformSource>());
        services.AddScoped<ISessionValidationSource>(provider =>
            provider.GetRequiredService<LegacyHrPlatformSource>());
        services.AddScoped<IAccessTokenClaimMaterialSource>(provider =>
            provider.GetRequiredService<LegacyHrPlatformSource>());
        services.AddScoped<ITenantModuleEntitlementSource>(provider =>
            provider.GetRequiredService<LegacyHrPlatformSource>());

        services.AddOptions<AuthenticationTokenOptions>()
            .Bind(configuration.GetSection(AuthenticationTokenOptions.SectionName))
            .PostConfigure(options => ApplyDevelopmentTokenDefaults(options, configuration))
            .ValidateDataAnnotations()
            .Validate(
                options => IsDevelopment(configuration) || IsProductionSigningKey(options.Key),
                "JwtOptions:Key must be a non-placeholder production secret.")
            .ValidateOnStart();
        services.AddSingleton(provider =>
            provider.GetRequiredService<IOptions<AuthenticationTokenOptions>>().Value);
        services.AddSingleton<IAuthenticationTokenValidationParametersFactory, JwtAuthenticationTokenValidationParametersFactory>();
        services.AddScoped<IAuthenticationTokenService, JwtAuthenticationTokenService>();
        services.AddTransient<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
        services.AddTransient<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddTransient<IAuthorizationHandler, TenantMemberAuthorizationHandler>();
        services.AddAuthorizationBuilder()
            .AddPolicy(
                AuthorizationPolicyNames.TenantMember,
                policy => policy
                    .RequireAuthenticatedUser()
                    .AddRequirements(new TenantMemberRequirement()))
            .SetFallbackPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());
        services.AddOptions<AuthenticationFeatureSettings>()
            .BindConfiguration(AuthenticationFeatureSettings.SectionName)
            .ValidateOnStart();

        return services;
    }

    private static void ApplyDevelopmentTokenDefaults(
        AuthenticationTokenOptions options,
        IConfiguration configuration)
    {
        if (!IsDevelopment(configuration) || !string.IsNullOrWhiteSpace(options.Key))
            return;

        options.Key = DevelopmentSigningKey;
    }

    internal static bool IsProductionSigningKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key))
            return false;

        return !string.Equals(key, DevelopmentSigningKey, StringComparison.Ordinal) &&
               !string.Equals(key, "<set-via-environment-or-local-config>", StringComparison.OrdinalIgnoreCase) &&
               !string.Equals(key, "YOUR_JWT_SECRET", StringComparison.OrdinalIgnoreCase) &&
               !string.Equals(key, "YOUR_SECRET_KEY", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsDevelopment(IConfiguration configuration)
    {
        var environmentName = configuration["ASPNETCORE_ENVIRONMENT"]
            ?? configuration["DOTNET_ENVIRONMENT"];

        return string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase);
    }
}
