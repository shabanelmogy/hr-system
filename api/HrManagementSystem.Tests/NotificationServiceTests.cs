using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using HrManagementSystem.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Platform.Notifications.Errors;
using HrManagementSystem.Features.Platform.Notifications.Mapping;
using HrManagementSystem.Features.Platform.Notifications.Services;
using HrManagementSystem.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Persistance;
using HrManagementSystem.Shared.Consts;
using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging.Abstractions;

namespace HrManagementSystem.Tests;

public sealed class NotificationServiceTests
{
    [Fact]
    public async Task GetAsync_ReturnsOnlyCurrentUsersVisibleNotifications()
    {
        await using var context = CreateContext();
        var now = DateTime.UtcNow;
        GrantPermission(context, "user-1");
        context.Notifications.AddRange(
            CreateNotification("user-1", now.AddMinutes(-1)),
            CreateNotification("user-2", now),
            CreateNotification("user-1", now.AddMinutes(-2), dismissedOn: now),
            CreateNotification("user-1", now.AddMinutes(-3), expiresOn: now.AddMinutes(-1)));
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.GetAsync("user-1", new NotificationQueryRequest());

        Assert.True(result.IsSuccess);
        var notification = Assert.Single(result.Value.Items);
        Assert.Equal("user-1", context.Notifications.Single(item => item.Id == notification.Id).RecipientUserId);
        Assert.Equal(1, result.Value.MetaData.TotalCount);
    }

    [Fact]
    public async Task MarkReadAsync_DoesNotAllowAccessToAnotherUsersNotification()
    {
        await using var context = CreateContext();
        var notification = CreateNotification("user-2", DateTime.UtcNow);
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.MarkReadAsync("user-1", notification.Id);

        Assert.True(result.IsFailure);
        Assert.Equal("Notification.NotificationNotFound", result.Error.Code);
        Assert.Null(notification.ReadOn);
    }

    [Fact]
    public async Task MarkReadAsync_IsIdempotentForTheOwner()
    {
        await using var context = CreateContext();
        var notification = CreateNotification("user-1", DateTime.UtcNow);
        GrantPermission(context, "user-1");
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var first = await service.MarkReadAsync("user-1", notification.Id);
        var readOn = await context.Notifications
            .Where(item => item.Id == notification.Id)
            .Select(item => item.ReadOn)
            .SingleAsync();
        var second = await service.MarkReadAsync("user-1", notification.Id);
        var readOnAfterSecondCall = await context.Notifications
            .Where(item => item.Id == notification.Id)
            .Select(item => item.ReadOn)
            .SingleAsync();

        Assert.True(first.IsSuccess);
        Assert.True(second.IsSuccess);
        Assert.NotNull(readOn);
        Assert.Equal(readOn, readOnAfterSecondCall);
    }

    [Fact]
    public async Task MarkUnreadAsync_ClearsReadStateForTheOwner()
    {
        await using var context = CreateContext();
        var notification = CreateNotification("user-1", DateTime.UtcNow);
        notification.ReadOn = DateTime.UtcNow;
        GrantPermission(context, "user-1");
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var first = await service.MarkUnreadAsync("user-1", notification.Id);
        var second = await service.MarkUnreadAsync("user-1", notification.Id);

        Assert.True(first.IsSuccess);
        Assert.True(second.IsSuccess);
        Assert.Null((await context.Notifications.SingleAsync(item => item.Id == notification.Id)).ReadOn);
    }

    [Fact]
    public async Task MarkUnreadAsync_DoesNotAllowAccessToAnotherUsersNotification()
    {
        await using var context = CreateContext();
        var notification = CreateNotification("user-2", DateTime.UtcNow);
        notification.ReadOn = DateTime.UtcNow;
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.MarkUnreadAsync("user-1", notification.Id);

        Assert.True(result.IsFailure);
        Assert.NotNull(notification.ReadOn);
    }

    [Fact]
    public async Task GetAsync_HidesExistingNotificationAfterPermissionIsRevoked()
    {
        await using var context = CreateContext();
        GrantPermission(context, "user-1");
        context.Notifications.Add(CreateNotification("user-1", DateTime.UtcNow));
        await context.SaveChangesAsync();

        context.RoleClaims.RemoveRange(context.RoleClaims);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.GetAsync("user-1", new NotificationQueryRequest());

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.Items);
        Assert.Equal(0, result.Value.MetaData.TotalCount);
    }

    [Fact]
    public async Task Publisher_CreatesRowsOnlyForActiveUsersWithRequiredPermission()
    {
        await using var context = CreateContext();
        var viewRole = new ApplicationRole("Country Viewer") { Id = "role-view" };
        var otherRole = new ApplicationRole("Other") { Id = "role-other" };
        var allowedUser = CreateUser("allowed");
        var deniedUser = CreateUser("denied");
        var disabledUser = CreateUser("disabled", isDisabled: true);

        context.Roles.AddRange(viewRole, otherRole);
        context.Users.AddRange(allowedUser, deniedUser, disabledUser);
        context.UserRoles.AddRange(
            new IdentityUserRole<string> { UserId = allowedUser.Id, RoleId = viewRole.Id },
            new IdentityUserRole<string> { UserId = deniedUser.Id, RoleId = otherRole.Id },
            new IdentityUserRole<string> { UserId = disabledUser.Id, RoleId = viewRole.Id });
        context.RoleClaims.Add(new IdentityRoleClaim<string>
        {
            RoleId = viewRole.Id,
            ClaimType = Permissions.Type,
            ClaimValue = Permissions.ViewCountries
        });
        await context.SaveChangesAsync();

        var publisher = new NotificationPublisher(
            context,
            CreateErrors(),
            new NoOpBackgroundJobClient(),
            NullLogger<NotificationPublisher>.Instance);

        var request = new NotificationPublishRequest(
            Permissions.ViewCountries,
            "GeographicalInformation",
            "Countries.Created",
            NotificationSeverity.Success,
            "CountryNotificationTitle",
            "CountryCreatedNotificationMessage",
            EntityType: "Country",
            EntityId: "1",
            ActionUrl: "/basic-data/countries",
            DeduplicationKey: "Countries.Created:1:test");

        var result = await publisher.PublishToPermissionAsync(request);
        var duplicate = await publisher.PublishToPermissionAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value);
        Assert.True(duplicate.IsSuccess);
        Assert.Equal(0, duplicate.Value);
        var saved = Assert.Single(context.Notifications);
        Assert.Equal(allowedUser.Id, saved.RecipientUserId);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new HttpContextAccessor());
    }

    private static NotificationService CreateService(ApplicationDbContext context)
    {
        var config = new TypeAdapterConfig();
        new NotificationMappingConfig().Register(config);
        return new NotificationService(context, CreateErrors(), new Mapper(config));
    }

    private static NotificationErrors CreateErrors() => new(new TestStringLocalizer<NotificationQueryRequest>());

    private static Notification CreateNotification(
        string recipientUserId,
        DateTime createdOn,
        DateTime? dismissedOn = null,
        DateTime? expiresOn = null) => new()
    {
        RecipientUserId = recipientUserId,
        RequiredPermission = Permissions.ViewCountries,
        Category = "GeographicalInformation",
        EventType = "Countries.Created",
        Severity = NotificationSeverity.Success,
        TitleKey = "CountryNotificationTitle",
        MessageKey = "CountryCreatedNotificationMessage",
        CorrelationId = Guid.NewGuid(),
        CreatedOn = createdOn,
        DismissedOn = dismissedOn,
        ExpiresOn = expiresOn
    };

    private static ApplicationUser CreateUser(string id, bool isDisabled = false) => new()
    {
        Id = id,
        UserName = id,
        FirstName = id,
        LastName = "User",
        IsDisabled = isDisabled
    };

    private static void GrantPermission(ApplicationDbContext context, string userId)
    {
        var roleId = $"role-{userId}";
        context.Roles.Add(new ApplicationRole("Viewer") { Id = roleId });
        context.UserRoles.Add(new IdentityUserRole<string> { UserId = userId, RoleId = roleId });
        context.RoleClaims.Add(new IdentityRoleClaim<string>
        {
            RoleId = roleId,
            ClaimType = Permissions.Type,
            ClaimValue = Permissions.ViewCountries
        });
    }

    private sealed class NoOpBackgroundJobClient : IBackgroundJobClient
    {
        public string Create(Job job, IState state) => Guid.NewGuid().ToString("N");

        public bool ChangeState(string jobId, IState state, string? expectedState) => true;
    }

    private sealed class TestStringLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments));

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
