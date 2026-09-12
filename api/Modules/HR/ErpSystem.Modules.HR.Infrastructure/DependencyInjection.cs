using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using ErpSystem.Modules.HR.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.Analytics.CrystalReports.Storage;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Services;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.SecurityAudits.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Localization.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Files.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Persistence;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Tenancy.Services;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using ErpSystem.Modules.Platform.Contracts.Localization;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.Platform.Contracts.Tenancy.Administration;

namespace ErpSystem.Modules.HR.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddGlobalService(configuration);
        services.AddDatabaseservice(configuration);
        services.AddErrorsService();
        services.AddAuthenticationService(configuration);
        services.AddScoped<ITenantModuleEntitlementService, TenantModuleEntitlementService>();
        services.AddScoped<ISelectionChallengePersistenceStore, AuthenticationSelectionChallengeStore>();
        services.AddScoped<ISecurityAuditRequestContextSource, HttpSecurityAuditRequestContextSource>();
        services.AddScoped<ISecurityAuditStore, SecurityAuditStore>();
        services.AddScoped<ILocalizationResourceStore, LocalizationResourceStore>();
        services.AddScoped<ILocalizationEffects, LocalizationEffects>();
        services.AddScoped<EntityChangeLogPersistenceAdapter>();
        services.AddScoped<IEntityChangeLogStore>(provider =>
            provider.GetRequiredService<EntityChangeLogPersistenceAdapter>());
        services.AddScoped<IEntityChangeLogQueryStore>(provider =>
            provider.GetRequiredService<EntityChangeLogPersistenceAdapter>());
        services.AddScoped<LegacyFileOperationsAdapter>();
        services.AddScoped<IFileMetadataStore>(provider =>
            provider.GetRequiredService<LegacyFileOperationsAdapter>());
        services.AddScoped<IFileBinaryStore>(provider =>
            provider.GetRequiredService<LegacyFileOperationsAdapter>());
        services.AddScoped<IFileChangePublisher>(provider =>
            provider.GetRequiredService<LegacyFileOperationsAdapter>());
        services.AddScoped<LegacyNotificationAdapter>();
        services.AddScoped<INotificationInboxStore>(provider => provider.GetRequiredService<LegacyNotificationAdapter>());
        services.AddScoped<INotificationInboxEffects>(provider => provider.GetRequiredService<LegacyNotificationAdapter>());
        services.AddScoped<INotificationPermissionCatalog>(provider => provider.GetRequiredService<LegacyNotificationAdapter>());
        services.AddScoped<INotificationRecipientResolver>(provider => provider.GetRequiredService<LegacyNotificationAdapter>());
        services.AddScoped<INotificationPublicationStore>(provider => provider.GetRequiredService<LegacyNotificationAdapter>());
        services.AddScoped<INotificationDeliveryEffects>(provider => provider.GetRequiredService<LegacyNotificationAdapter>());
        services.AddScoped<TenantManagementService>();
        services.AddScoped<TenantAdminService>();
        services.AddScoped<ITenantManagementAdapter, LegacyHrTenantManagementAdapter>();
        services.AddScoped<ITenantAdministratorAdapter, LegacyHrTenantAdministratorAdapter>();
        services.AddScoped<ITenantManagementService, PlatformTenantManagementCompatibilityService>();
        services.AddScoped<ITenantAdminService, PlatformTenantAdministratorCompatibilityService>();
        services.AddHangfireService(configuration);
        services.AddCultureService();
        services.AddEntitiesService();
        services.AddFluentValidationService();
        services.AddMapsetrService();
        services.AddHttpClient<IAttendanceConnectorClient, AttendanceConnectorClient>((provider, client) =>
        {
            var baseUrl = configuration["AttendanceConnector:BaseUrl"];
            if (Uri.TryCreate(baseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromSeconds(Math.Clamp(configuration.GetValue<int?>("AttendanceConnector:TimeoutSeconds") ?? 120, 5, 300));
            client.MaxResponseContentBufferSize = 32 * 1024 * 1024;
        });
        services.AddSendEmailService(configuration);
        services.Configure<CrystalReportStorageOptions>(
            configuration.GetSection(CrystalReportStorageOptions.SectionName));
        services.AddHttpClient<ICrystalReportInspector, CrystalReportInspectorClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
            if (Uri.TryCreate(options.InspectorBaseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<ICrystalReportLegacySource, CrystalReportLegacySourceClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
            if (Uri.TryCreate(options.InspectorBaseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<ICrystalReportRenderer, CrystalReportRendererClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
            if (Uri.TryCreate(options.InspectorBaseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromMinutes(2);
        });

        return services;
    }
}
