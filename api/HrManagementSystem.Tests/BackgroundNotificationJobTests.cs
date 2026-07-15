using Hangfire;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Jobs;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Services;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Jobs;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Services;
using HrManagementSystem.Features.GeographicalInformation.Countries.Jobs;
using HrManagementSystem.Features.GeographicalInformation.Countries.Services;
using HrManagementSystem.Features.GeographicalInformation.Districts.Jobs;
using HrManagementSystem.Features.GeographicalInformation.Districts.Services;
using HrManagementSystem.Features.GeographicalInformation.States.Jobs;
using HrManagementSystem.Features.GeographicalInformation.States.Services;
using HrManagementSystem.Features.Platform.Notifications.Services;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Security.Authentication.Jobs;
using HrManagementSystem.Features.Security.Authentication.Services;
using HrManagementSystem.Features.Security.Users.Jobs;
using HrManagementSystem.Features.Security.Users.Services;
using HrManagementSystem.Shared.Consts;
using Microsoft.AspNetCore.SignalR;

namespace HrManagementSystem.Tests;

public sealed class BackgroundNotificationJobTests
{
    [Theory]
    [InlineData(typeof(CountryService))]
    [InlineData(typeof(StateService))]
    [InlineData(typeof(DistrictService))]
    [InlineData(typeof(AddressTypeService))]
    [InlineData(typeof(AddressService))]
    [InlineData(typeof(UserService))]
    [InlineData(typeof(AuthService))]
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
    [InlineData("Delete", "Countries.Deleted", "CountryDeletedNotificationMessage", NotificationSeverity.Warning)]
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

}
