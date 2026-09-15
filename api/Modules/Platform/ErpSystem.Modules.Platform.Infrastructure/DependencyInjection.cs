using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Application.Files;
using ErpSystem.Modules.Platform.Application.Localization;
using ErpSystem.Modules.Platform.Application.OfflineOperations;
using ErpSystem.Modules.Platform.Application.SecurityAudits;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.EntityChangeLogs;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Communications;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.Communications;
using ErpSystem.Modules.Platform.Infrastructure.Files;
using ErpSystem.Modules.Platform.Infrastructure.OfflineOperations;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Infrastructure.Hangfire;
using ErpSystem.Modules.Platform.Infrastructure.Features.Tenancy;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.Mapping;
using ErpSystem.Modules.Platform.Infrastructure.Realtime;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Files.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Localization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Notifications.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.SecurityAudits.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.ApiKeys.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Invitations.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Invitations.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Services;
using ErpSystem.Modules.Platform.Application.Notifications;
using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Policies;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Services;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application.Features.CompanyGeography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

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
        services.AddPlatformMapster();

        services.AddOptions<WapilotOptions>()
            .BindConfiguration(WapilotOptions.SectionName)
            .Validate(options => options.IsValid(), "WhatsApp:Wapilot settings are invalid.")
            .ValidateOnStart();
        services.AddHttpClient<IWhatsAppSender, WapilotWhatsAppSender>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<WapilotOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/", UriKind.Absolute);
            client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
        });

        services.AddScoped<IRealtimeChangeDispatcher, HangfireRealtimeChangeDispatcher>();
        services.AddScoped<IRealtimeEntityPublisher, SignalRRealtimeEntityPublisher>();
        services.AddScoped<RealtimeEntityChangedJob>();
        services.AddScoped<IHostRuntimeStartupTask, PlatformSystemRoleStartupTask>();
        services.AddScoped<IHostRuntimeStartupTask, PlatformBootstrapUsersStartupTask>();

        services.AddScoped<LocalizationResourceStore>();
        services.AddScoped<ILocalizationResourceStore>(provider => provider.GetRequiredService<LocalizationResourceStore>());
        services.AddScoped<ILocalizationEffects, LocalizationEffects>();
        services.AddScoped<PlatformNotificationStore>();
        services.AddScoped<INotificationInboxStore>(provider => provider.GetRequiredService<PlatformNotificationStore>());
        services.AddScoped<INotificationInboxEffects>(provider => provider.GetRequiredService<PlatformNotificationStore>());
        services.AddScoped<INotificationPermissionCatalog>(provider => provider.GetRequiredService<PlatformNotificationStore>());
        services.AddScoped<INotificationRecipientResolver>(provider => provider.GetRequiredService<PlatformNotificationStore>());
        services.AddScoped<INotificationPublicationStore>(provider => provider.GetRequiredService<PlatformNotificationStore>());
        services.AddScoped<INotificationDeliveryEffects>(provider => provider.GetRequiredService<PlatformNotificationStore>());
        services.AddScoped<PlatformFileOperationsStore>();
        services.AddSingleton<IFileStoragePolicy, FileStoragePolicy>();
        services.AddScoped<IFileMetadataStore>(provider => provider.GetRequiredService<PlatformFileOperationsStore>());
        services.AddScoped<IFileBinaryStore>(provider => provider.GetRequiredService<PlatformFileOperationsStore>());
        services.AddScoped<IFileChangePublisher>(provider => provider.GetRequiredService<PlatformFileOperationsStore>());

        services.AddScoped<ISecurityAuditRequestContextSource, HttpSecurityAuditRequestContextSource>();
        services.AddScoped<ISecurityAuditStore, SecurityAuditStore>();
        services.AddScoped<ISecurityAuditReadStore, SecurityAuditReadStore>();

        services.AddScoped<IApiKeyReadStore, ApiKeyReadStore>();
        services.AddScoped<IApiKeyWriteStore, ApiKeyWriteStore>();
        services.AddScoped<IApiKeyCredentialGenerator, ApiKeyCredentialGenerator>();
        services.AddScoped<IApiKeyEffects, ApiKeyEffects>();
        services.AddScoped<IRoleValidationQueries, RoleValidationQueries>();
        services.AddScoped<IRoleManagementReadStore, RoleManagementReadStore>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleUnitOfWork, RoleUnitOfWork>();
        services.AddSingleton<IRoleLockResourceFactory, RoleLockResourceFactory>();
        services.AddScoped<IRolePostCommitEffects, RolePostCommitEffects>();
        services.AddScoped<TenantRoleAssignmentService>();
        services.AddScoped<SessionRevocationNotifier>();
        services.AddScoped<IUserValidationQueries, UserValidationQueries>();
        services.AddScoped<IUserManagementReadStore, UserManagementReadStore>();
        services.AddScoped<IUserProfileStore, UserProfileStore>();
        services.AddScoped<IUserProfileEffects, UserProfileEffects>();
        services.AddScoped<IUserSeatLimitService, UserSeatLimitService>();
        services.AddScoped<IUserInvitationRepository, UserInvitationRepository>();
        services.AddScoped<IUserInvitationIdentityGateway, UserInvitationIdentityGateway>();
        services.AddScoped<IUserInvitationRoleGateway, UserInvitationRoleGateway>();
        services.AddScoped<IUserInvitationCompanyAccessQuery, UserInvitationCompanyAccessQuery>();
        services.AddScoped<IUserInvitationTenantEligibilityQuery, UserInvitationTenantEligibilityQuery>();
        services.AddScoped<IUserInvitationAccessWriter, UserInvitationAccessWriter>();
        services.AddSingleton<IUserInvitationTokenProvider, UserInvitationTokenProvider>();
        services.AddScoped<IUserInvitationEmailSender, UserInvitationEmailSender>();
        services.AddScoped<IUserInvitationUnitOfWork, UserInvitationUnitOfWork>();
        services.AddScoped<IUserManagementWriteStore, UserManagementWriteStore>();

        services.AddScoped<IOfflineOperationsPolicyStore, OfflineOperationsPolicyStore>();
        services.AddScoped<PlatformContractSource>();
        services.AddScoped<ITenantAccessSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<ITenantMembershipSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<ICompanyAccessSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<ICompanyGeographySource, PlatformCompanyGeographySource>();
        services.AddScoped<IPlatformAuthorizationSource, PlatformAuthorizationSource>();
        services.AddScoped<ICompanyGeographicScopeStore, PlatformCompanyGeographicScopeStore>();
        services.AddScoped<IEntityChangeLogStore, EntityChangeLogPersistenceAdapter>();
        services.AddScoped<IEntityChangeLogQueryStore, EntityChangeLogPersistenceAdapter>();
        services.AddScoped<CurrentActor>();
        services.AddScoped<ICurrentActor>(provider =>
            provider.GetRequiredService<CurrentActor>());
        services.AddScoped<ICurrentActorScope>(provider =>
            provider.GetRequiredService<CurrentActor>());
        services.AddScoped<ISessionValidationSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<IAccessTokenClaimMaterialSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<ITenantModuleEntitlementSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<ISelectionChallengeSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        services.AddScoped<ITenantManagementAdapter, PlatformTenantManagementAdapter>();
        services.AddScoped<ITenantAdministratorAdapter, PlatformTenantAdministratorAdapter>();
        services.AddPlatformIdentity(configuration);
        services.AddHttpClient<IGoogleIdentityVerifier, GoogleIdentityVerifier>();
        services.AddPlatformHangfire(configuration);

        services.AddOptions<FileSecurityOptions>()
            .BindConfiguration(FileSecurityOptions.SectionName)
            .Validate(options => options.IsValid(out _),
                "FileSecurity settings are invalid.")
            .ValidateOnStart();
        services.AddSingleton<IFileMalwareScanner, ClamAvTcpClient>();
        services.AddSingleton<IFileUploadInspectionService, FileUploadInspectionService>();

        if (configuration.GetValue<bool>($"{FileSecurityOptions.SectionName}:MalwareScanningEnabled"))
        {
            services.AddHealthChecks().AddCheck<ClamAvHealthCheck>(
                "file-security:clamav",
                tags: ["ready"],
                timeout: TimeSpan.FromSeconds(5));
        }

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
        services.AddOptions<InvitationSettings>()
            .BindConfiguration(InvitationSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }

    private static void ApplyDevelopmentTokenDefaults(
        AuthenticationTokenOptions options,
        IConfiguration configuration)
    {
        if (!string.IsNullOrWhiteSpace(options.Key))
            return;

        if (IsDevelopment(configuration))
        {
            options.Key = DevelopmentSigningKey;
            return;
        }

        if (!configuration.GetValue(
                "DeploymentValidation:EnforceProductionReadiness",
                defaultValue: true))
        {
            options.Key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }
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
