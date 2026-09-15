using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Files;
using ErpSystem.Modules.Platform.Application.Localization;
using ErpSystem.Modules.Platform.Application.Notifications;
using ErpSystem.Modules.Platform.Application.SecurityAudits;
using ErpSystem.Modules.Platform.Application.Features.Platform.Localization.Errors;
using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Errors;
using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Services;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Files.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Notifications.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.Realtime;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformInfrastructureCompositionTests
{
    [Fact]
    public void PlatformInfrastructure_RegistersRuntimeFacingServicesAndPorts()
    {
        var services = new ServiceCollection();
        services.AddPlatformApplication();
        services.AddPlatformInfrastructure(Configuration());

        var expected = new[]
        {
            typeof(IUserManagementWriteStore),
            typeof(IUserInvitationRepository),
            typeof(IUserInvitationIdentityGateway),
            typeof(IUserInvitationRoleGateway),
            typeof(IUserInvitationCompanyAccessQuery),
            typeof(IUserInvitationTenantEligibilityQuery),
            typeof(IUserInvitationAccessWriter),
            typeof(IUserInvitationTokenProvider),
            typeof(IUserInvitationEmailSender),
            typeof(IUserInvitationUnitOfWork),
            typeof(IUserSeatLimitService),
            typeof(IUserValidationQueries),
            typeof(IUserManagementReadStore),
            typeof(IUserProfileStore),
            typeof(IUserProfileEffects),
            typeof(IRoleManagementReadStore),
            typeof(IRoleRepository),
            typeof(IRoleUnitOfWork),
            typeof(IRolePostCommitEffects),
            typeof(IRoleValidationQueries),
            typeof(IApiKeyReadStore),
            typeof(IApiKeyWriteStore),
            typeof(IApiKeyCredentialGenerator),
            typeof(IApiKeyEffects),
            typeof(ILocalizationResourceStore),
            typeof(ILocalizationEffects),
            typeof(INotificationInboxStore),
            typeof(INotificationInboxEffects),
            typeof(INotificationPermissionCatalog),
            typeof(INotificationRecipientResolver),
            typeof(INotificationPublicationStore),
            typeof(INotificationDeliveryEffects),
            typeof(IFileMetadataStore),
            typeof(IFileBinaryStore),
            typeof(IFileChangePublisher),
            typeof(ISecurityAuditRequestContextSource),
            typeof(ISecurityAuditStore),
            typeof(ISecurityAuditReadStore),
            typeof(IRealtimeChangeDispatcher),
            typeof(IRealtimeEntityPublisher),
            typeof(IHostRuntimeStartupTask)
        };

        foreach (var serviceType in expected)
            Assert.Contains(services, descriptor => descriptor.ServiceType == serviceType);

        Assert.Contains(services, descriptor =>
            descriptor.ServiceType == typeof(IHostRuntimeStartupTask) &&
            descriptor.ImplementationType == typeof(PlatformSystemRoleStartupTask));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(PlatformNotificationStore));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(PlatformFileOperationsStore));
        Assert.Contains(services, descriptor =>
            descriptor.ServiceType == typeof(IRealtimeChangeDispatcher) &&
            descriptor.ImplementationType == typeof(HangfireRealtimeChangeDispatcher));
        Assert.Contains(services, descriptor =>
            descriptor.ServiceType == typeof(IRealtimeEntityPublisher) &&
            descriptor.ImplementationType == typeof(SignalRRealtimeEntityPublisher));
    }

    [Fact]
    public void PlatformApplication_RegistersLegacyErrorCatalogsStillUsedByPlatformAdapters()
    {
        var services = new ServiceCollection().AddPlatformApplication();

        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(UserErrors));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(RoleErrors));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(ApiKeyErrors));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(LocalizationError));
        Assert.Contains(services, descriptor => descriptor.ServiceType == typeof(NotificationErrors));
    }

    private static IConfiguration Configuration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(localdb)\\mssqllocaldb;Database=ErpSystemPlatformComposition;Trusted_Connection=True;TrustServerCertificate=True",
                ["ASPNETCORE_ENVIRONMENT"] = "Development",
                ["FileSecurity:MalwareScanningEnabled"] = "false",
                ["HangfireSettings:AllowedHosts:0"] = "localhost"
            })
            .Build();
}
