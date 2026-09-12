using System.Reflection;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.Notifications.Services;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Presentation.Features.Platform.Notifications.V1;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class PlatformNotificationOwnershipTests
{
    private static readonly DateTime Now = new(2026, 9, 10, 20, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void GenericNotificationOwnership_PointsFromHrToPlatformContractsOnly()
    {
        var platformContractsReferences = typeof(INotificationPublisher).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformApplicationReferences = typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);

        Assert.Equal("ErpSystem.Modules.Platform.Contracts", typeof(INotificationPublisher).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", typeof(NotificationPublishRequest).Assembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", typeof(NotificationSeverity).Assembly.GetName().Name);

        var services = new ServiceCollection();
        services.AddPlatformApplication();
        Assert.Contains(services, descriptor =>
            descriptor.ServiceType == typeof(INotificationPublisher) &&
            descriptor.ImplementationType?.Assembly.GetName().Name == "ErpSystem.Modules.Platform.Application");
        Assert.Contains(services, descriptor =>
            descriptor.ServiceType == typeof(INotificationInboxService) &&
            descriptor.ImplementationType?.Assembly.GetName().Name == "ErpSystem.Modules.Platform.Application");

        Assert.Contains(typeof(INotificationInboxStore), typeof(LegacyNotificationAdapter).GetInterfaces());
        Assert.Contains(typeof(INotificationRecipientResolver), typeof(LegacyNotificationAdapter).GetInterfaces());
        Assert.Contains(typeof(INotificationPublicationStore), typeof(LegacyNotificationAdapter).GetInterfaces());
        Assert.Contains(typeof(INotificationDeliveryEffects), typeof(LegacyNotificationAdapter).GetInterfaces());
    }

    [Fact]
    public void PlatformApplication_OwnsPublicationValidationPolicy()
    {
        var services = new ServiceCollection();
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<INotificationPublicationPolicy>();

        var valid = Request();
        Assert.True(policy.IsValid(valid, Now));
        Assert.False(policy.IsValid(valid with { ActionUrl = "https://example.com/notifications" }, Now));
        Assert.False(policy.IsValid(valid with { ActionUrl = "//example.com/notifications" }, Now));
        Assert.False(policy.IsValid(valid with { CompanyId = 3, TenantId = null }, Now));
        Assert.False(policy.IsValid(valid with { ExpiresOn = Now }, Now));
        Assert.False(policy.IsValid(valid with { RequiredPermission = new string('p', 151) }, Now));
    }

    [Fact]
    public void ExistingInboxWireContract_RemainsHrOwnedAndRouteCompatible()
    {
        var method = typeof(NotificationsController).GetMethod(nameof(NotificationsController.GetAll));
        Assert.NotNull(method);
        Assert.Equal(
            typeof(ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Contracts.NotificationQueryRequest),
            method!.GetParameters()[0].ParameterType);
        Assert.Equal("getAll", method.GetCustomAttribute<HttpGetAttribute>()!.Template);
        Assert.Equal(
            "ErpSystem.Modules.HR.Application",
            typeof(ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Contracts.NotificationPageResponse)
                .Assembly.GetName().Name);
        Assert.Equal(1, (int)NotificationSeverity.Info);
        Assert.Equal(4, (int)NotificationSeverity.Critical);
    }

    [Fact]
    public async Task LegacyHrPersistenceAdapter_KeepsNotificationTableAndSchema()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(
            options,
            new EmptyCurrentActor(),
            TimeProvider.System);

        var entityType = context.Model.FindEntityType(typeof(Notification));
        Assert.NotNull(entityType);
        Assert.Equal("Notifications", entityType!.GetTableName());
        Assert.Equal(ApplicationDbContext.Schema, entityType.GetSchema());
    }

    private static NotificationPublishRequest Request() => new(
        "Countries:View",
        "GeographicalInformation",
        "Countries.Created",
        NotificationSeverity.Success,
        "CountryNotificationTitle",
        "CountryCreatedNotificationMessage",
        ActionUrl: "/basic-data/countries",
        TenantId: "tenant-1",
        CompanyId: 1,
        ExpiresOn: Now.AddMinutes(1));

    private sealed class EmptyCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
