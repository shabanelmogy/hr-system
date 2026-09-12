using FluentValidation;
using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.EntityChangeLogs;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Files;
using ErpSystem.Modules.Platform.Application.Localization;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Application.Notifications;
using ErpSystem.Modules.Platform.Application.OfflineOperations;
using ErpSystem.Modules.Platform.Application.SecurityAudits;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Contracts.Localization;
using ErpSystem.Modules.Platform.Contracts.Modules;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.Platform.Contracts.OfflineOperations;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using ErpSystem.Modules.Platform.Contracts.SessionValidation;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Tenancy.Administration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.Platform.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddPlatformApplication(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();
        services.AddScoped<ISelectionChallengeService, SelectionChallengeService>();
        services.AddScoped<IAccessTokenClaimMaterialService, AccessTokenClaimMaterialService>();
        services.AddScoped<IAuthenticationLoginOrchestrator, AuthenticationLoginOrchestrator>();
        services.AddScoped<IAuthenticationSessionOrchestrator, AuthenticationSessionOrchestrator>();
        services.AddScoped<IAuthenticationSessionContextService, AuthenticationSessionContextService>();
        services.AddScoped<IAuthenticationAccountOrchestrator, AuthenticationAccountOrchestrator>();
        services.AddSingleton<IAuthenticationFeaturePolicy, AuthenticationFeaturePolicy>();
        services.TryAddScoped<IModuleCatalogPolicy, ModuleCatalogPolicy>();
        services.AddScoped<IModuleCatalogQueries, ModuleCatalogQueries>();
        services.AddScoped<ILocalizationAdministration, LocalizationAdministration>();
        services.TryAddSingleton<INotificationPublicationPolicy, NotificationPublicationPolicy>();
        services.AddScoped<INotificationPublisher, NotificationPublisher>();
        services.AddScoped<INotificationInboxService, NotificationInboxService>();
        services.AddScoped<IOfflineOperationsPolicyService, OfflineOperationsPolicyService>();
        services.AddScoped<ISecurityAuditService, SecurityAuditService>();
        services.AddScoped<ITenantModuleEntitlementService, TenantModuleEntitlementService>();
        services.AddScoped<ITenantAccessService, TenantAccessService>();
        services.AddScoped<ITenantManagementOrchestrator, TenantManagementOrchestrator>();
        services.AddScoped<ITenantAdministratorOrchestrator, TenantAdministratorOrchestrator>();
        services.TryAddSingleton<ITenantAdministrationPolicy, TenantAdministrationPolicy>();
        services.AddScoped<ITenantMembershipService, TenantMembershipService>();
        services.AddScoped<ICompanyAccessService, CompanyAccessService>();
        services.AddScoped<IEntityChangeLogService, EntityChangeLogService>();
        services.AddScoped<ISessionValidationService, SessionValidationService>();
        services.TryAddSingleton<IFileStoragePolicy, FileStoragePolicy>();
        services.AddScoped<IFileOperationsService, FileOperationsService>();

        return services;
    }
}
