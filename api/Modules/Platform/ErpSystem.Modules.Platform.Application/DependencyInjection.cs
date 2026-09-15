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
using ErpSystem.Modules.Platform.Application.Features.Platform.Localization.Errors;
using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Policies;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
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
        services.AddSingleton<IAuthenticationFeaturePolicy, AuthenticationFeaturePolicy>();
        services.AddSingleton<IUserInvitationPolicy, UserInvitationPolicy>();
        services.TryAddScoped<IModuleCatalogPolicy, ModuleCatalogPolicy>();
        services.TryAddSingleton<INotificationPublicationPolicy, NotificationPublicationPolicy>();
        services.AddScoped<INotificationPublisher, NotificationPublisher>();
        services.AddScoped<INotificationInboxService, NotificationInboxService>();
        services.AddScoped<ISecurityAuditService, SecurityAuditService>();
        services.AddScoped<ITenantAccessService, TenantAccessService>();
        services.TryAddSingleton<ITenantAdministrationPolicy, TenantAdministrationPolicy>();
        services.AddScoped<ITenantMembershipService, TenantMembershipService>();
        services.AddScoped<ICompanyAccessService, CompanyAccessService>();
        services.AddScoped<IEntityChangeLogService, EntityChangeLogService>();
        services.AddScoped<ISessionValidationService, SessionValidationService>();
        services.AddScoped<LocalizationError>();
        services.AddScoped<NotificationErrors>();
        services.AddScoped<ApiKeyErrors>();
        services.AddScoped<RoleErrors>();
        services.AddScoped<UserErrors>();

        return services;
    }
}
