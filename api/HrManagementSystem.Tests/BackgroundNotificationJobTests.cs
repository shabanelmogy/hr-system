using Hangfire;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Jobs;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Jobs;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Jobs;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Services;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Services;
using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Jobs;
using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Features.Security.Users.Jobs;
using HrManagementSystem.Application.Features.Security.Users.Services;
using HrManagementSystem.Infrastructure.Features.Security.Users.Services;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Infrastructure.Features.Appointments.Jobs;
using Microsoft.AspNetCore.SignalR;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Catalog.Categories.Services;
using HrManagementSystem.Infrastructure.Features.Catalog.SubCategories.Services;
using HrManagementSystem.Infrastructure.Features.Analytics.Reports.Services;
using HrManagementSystem.Infrastructure.Features.Analytics.Views.Services;
using HrManagementSystem.Infrastructure.Features.Security.ApiKeys.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;
using HrManagementSystem.Infrastructure.Features.Platform.Localization.Services;
using HrManagementSystem.Infrastructure.Features.Tenancy.Services;
using HrManagementSystem.Infrastructure.Features.Platform.Files.Services;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Services;

namespace HrManagementSystem.Tests;

public sealed class BackgroundNotificationJobTests
{
    [Theory]
    [InlineData(typeof(CountryChangeScheduler))]
    [InlineData(typeof(StateService))]
    [InlineData(typeof(DistrictService))]
    [InlineData(typeof(AddressTypeService))]
    [InlineData(typeof(AddressService))]
    [InlineData(typeof(UserService))]
    [InlineData(typeof(AuthLoginService))]
    [InlineData(typeof(AuthSessionService))]
    [InlineData(typeof(AuthAccountService))]
    public void EntityServices_QueueJobsWithoutDependingOnNotificationTransports(Type serviceType)
    {
        var parameterTypes = serviceType.GetConstructors().Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToList();

        Assert.DoesNotContain(typeof(INotificationPublisher), parameterTypes);
        Assert.DoesNotContain(parameterTypes, type =>
            type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IHubContext<,>));
    }

    [Theory]
    [InlineData(typeof(CountryChangedJob))]
    [InlineData(typeof(StateChangedJob))]
    [InlineData(typeof(DistrictChangedJob))]
    [InlineData(typeof(AddressTypeChangedJob))]
    [InlineData(typeof(AddressChangedJob))]
    [InlineData(typeof(UserChangedJob))]
    [InlineData(typeof(SessionRevokedJob))]
    [InlineData(typeof(AppointmentChangedJob))]
    [InlineData(typeof(RealtimeEntityChangedJob))]
    public void FeatureJobs_UseHangfireAutomaticRetries(Type jobType)
    {
        var retry = Assert.Single(
            jobType.GetCustomAttributes(typeof(AutomaticRetryAttribute), inherit: true)
                .Cast<AutomaticRetryAttribute>());

        Assert.Equal(5, retry.Attempts);
    }

    [Theory]
    [InlineData(typeof(CountryChangedJobRequest))]
    [InlineData(typeof(StateChangedJobRequest))]
    [InlineData(typeof(DistrictChangedJobRequest))]
    [InlineData(typeof(AddressTypeChangedJobRequest))]
    [InlineData(typeof(AddressChangedJobRequest))]
    [InlineData(typeof(UserChangedJobRequest))]
    [InlineData(typeof(AppointmentChangedJobRequest))]
    public void EntityJobRequests_IncludeActionActorAndOperation(Type requestType)
    {
        var properties = requestType.GetProperties().Select(property => property.Name).ToList();

        Assert.Contains("Action", properties);
        Assert.Contains("ActorUserId", properties);
        Assert.Contains("OperationId", properties);
    }

    [Theory]
    [InlineData("Add", "Countries.Created", "CountryCreatedNotificationMessage", NotificationSeverity.Success)]
    [InlineData("BulkAdd", "Countries.BulkCreated", "CountriesCreatedNotificationMessage", NotificationSeverity.Success)]
    [InlineData("BulkArchive", "Countries.BulkArchived", "CountriesArchivedNotificationMessage", NotificationSeverity.Warning)]
    [InlineData("Delete", "Countries.Deleted", "CountryDeletedNotificationMessage", NotificationSeverity.Warning)]
    [InlineData("Archive", "Countries.Archived", "CountryArchivedNotificationMessage", NotificationSeverity.Warning)]
    public void NotificationFactory_UsesConsistentDetailedMetadata(
        string action,
        string expectedEventType,
        string expectedMessageKey,
        NotificationSeverity expectedSeverity)
    {
        var operationId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var request = NotificationPublishRequestFactory.Create(
            Permissions.ViewCountries,
            "GeographicalInformation",
            "Country",
            "Countries",
            action,
            new Dictionary<string, string> { ["NameEn"] = "Egypt" },
            "1",
            "/basic-data/countries",
            "actor-1",
            operationId);

        Assert.Equal(expectedEventType, request.EventType);
        Assert.Equal(expectedMessageKey, request.MessageKey);
        Assert.Equal(expectedSeverity, request.Severity);
        Assert.Equal($"{expectedEventType}:1:{operationId:N}", request.DeduplicationKey);
    }

    [Fact]
    public async Task CountryBulkArchiveJob_PublishesOneDurableNotificationAndGenericInvalidation()
    {
        var operationId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var notifications = new RecordingNotificationPublisher();
        var realtime = new RecordingRealtimeEntityPublisher();
        var job = new CountryChangedJob(notifications, realtime);

        await job.ExecuteAsync(
            new CountryChangedJobRequest(null, "BulkArchive", 3, "actor-1", operationId),
            CancellationToken.None);

        var notification = Assert.Single(notifications.Requests);
        Assert.Equal("Countries.BulkArchived", notification.EventType);
        Assert.Equal("CountriesArchivedNotificationMessage", notification.MessageKey);
        Assert.Equal(NotificationSeverity.Warning, notification.Severity);
        Assert.Equal("3", notification.Parameters!["Count"]);
        Assert.Null(notification.EntityId);
        Assert.Equal($"Countries.BulkArchived:bulk:{operationId:N}", notification.DeduplicationKey);

        var change = Assert.Single(realtime.Requests);
        Assert.Equal("countries", change.Resource);
        Assert.Equal("BulkArchive", change.Action);
        Assert.Null(change.EntityId);
        Assert.Equal(operationId, change.EventId);
    }

    [Fact]
    public void RealtimeGroups_SeparateGlobalPermissionCompanyPermissionAndUserAudiences()
    {
        Assert.Equal(
            "permission:Countries:View",
            GeneralHubGroups.ForPermission(Permissions.ViewCountries));
        Assert.Equal(
            "tenant:tenant-1:permission:Countries:View",
            GeneralHubGroups.ForTenantPermission("tenant-1", Permissions.ViewCountries));
        Assert.Equal(
            "tenant:tenant-1:role:role-1",
            GeneralHubGroups.ForTenantRole("tenant-1", "role-1"));
        Assert.Equal(
            "tenant:tenant-1:company:7:permission:Users:View",
            GeneralHubGroups.ForCompanyPermission("tenant-1", 7, Permissions.ViewUsers));
        Assert.Equal(
            "tenant:tenant-1:company:7:user:user-1",
            GeneralHubGroups.ForUserCompany("tenant-1", 7, "user-1"));
    }

    [Theory]
    [InlineData(typeof(CategoryService))]
    [InlineData(typeof(SubcategoryService))]
    [InlineData(typeof(ReportCategoryService))]
    [InlineData(typeof(ViewService))]
    [InlineData(typeof(ApiKeyService))]
    [InlineData(typeof(RoleService))]
    [InlineData(typeof(LocalizationService))]
    [InlineData(typeof(TenantManagementService))]
    [InlineData(typeof(TenantAdminService))]
    [InlineData(typeof(FileService))]
    [InlineData(typeof(UserService))]
    [InlineData(typeof(AuthLoginService))]
    [InlineData(typeof(AuthAccountService))]
    [InlineData(typeof(NotificationService))]
    public void NewlyCoveredMutationServices_UseDispatcherInsteadOfSignalR(Type serviceType)
    {
        var parameterTypes = serviceType.GetConstructors().Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToList();

        Assert.Contains(typeof(IRealtimeChangeDispatcher), parameterTypes);
        Assert.DoesNotContain(parameterTypes, type =>
            type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IHubContext<,>));
    }

    [Fact]
    public void RealtimeAudience_RequiresCompleteCompanyIsolationScope()
    {
        Assert.Throws<ArgumentException>(() =>
            RealtimeAudience.ForCompanyPermission("", 7, Permissions.ViewCategories));
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            RealtimeAudience.ForCompanyPermission("tenant-1", 0, Permissions.ViewCategories));

        var audience = RealtimeAudience.ForCompanyPermission(
            "tenant-1",
            7,
            Permissions.ViewCategories);

        Assert.Equal(RealtimeAudienceKind.CompanyPermission, audience.Kind);
        Assert.Equal("tenant-1", audience.TenantId);
        Assert.Equal(7, audience.CompanyId);
        Assert.Equal(Permissions.ViewCategories, audience.Permission);

        var tenantAudience = RealtimeAudience.ForTenant("tenant-1");
        Assert.Equal(RealtimeAudienceKind.Tenant, tenantAudience.Kind);
        Assert.Equal("tenant-1", tenantAudience.TenantId);
    }

    [Theory]
    [InlineData(typeof(Country), "countries")]
    [InlineData(typeof(AddressType), "address-types")]
    [InlineData(typeof(ApplicationUser), "users")]
    [InlineData(typeof(ApplicationRole), "roles")]
    [InlineData(typeof(EntityChangeLog), "entity-change-logs")]
    public void RealtimeResources_AreDerivedFromEntityTypes(Type entityType, string expected)
    {
        Assert.Equal(expected, RealtimeResource.For(entityType));
    }

    private sealed class RecordingNotificationPublisher : INotificationPublisher
    {
        public List<NotificationPublishRequest> Requests { get; } = [];

        public Task<Result<int>> PublishToPermissionAsync(
            NotificationPublishRequest request,
            CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            return Task.FromResult(Result.Success(1));
        }
    }

    private sealed class RecordingRealtimeEntityPublisher : IRealtimeEntityPublisher
    {
        public List<RealtimeChangeRequest> Requests { get; } = [];

        public Task PublishAsync(
            RealtimeChangeRequest request,
            CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            return Task.CompletedTask;
        }
    }

}
