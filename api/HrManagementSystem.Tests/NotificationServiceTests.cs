using System.Reflection;
using System.Globalization;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Entities;
using HrManagementSystem.Application.Features.Platform.Notifications.Errors;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Mapping;
using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Application.Common.Consts;
using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging.Abstractions;
using HrManagementSystem.Application.Common.Realtime;

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

        var dispatcher = new RecordingRealtimeDispatcher();
        var service = CreateService(context, dispatcher);
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
        var change = Assert.Single(dispatcher.Requests);
        Assert.Equal("notifications", change.Resource);
        Assert.Equal("MarkRead", change.Action);
        Assert.Equal(notification.Id.ToString(CultureInfo.InvariantCulture), change.EntityId);
        Assert.Equal(RealtimeAudienceKind.UserCompany, change.Audience.Kind);
        Assert.Equal("tenant-1", change.Audience.TenantId);
        Assert.Equal(1, change.Audience.CompanyId);
        Assert.Equal("user-1", change.Audience.UserId);
    }

    [Fact]
    public async Task IndividualNotificationStateChanges_DispatchOnlyAfterRowsChange()
    {
        await using var context = CreateContext();
        var first = CreateNotification("user-1", DateTime.UtcNow.AddMinutes(-1));
        GrantPermission(context, "user-1");
        context.Notifications.Add(first);
        await context.SaveChangesAsync();

        var dispatcher = new RecordingRealtimeDispatcher();
        var service = CreateService(context, dispatcher);

        Assert.True((await service.MarkReadAsync("user-1", first.Id)).IsSuccess);
        Assert.True((await service.DismissAsync("user-1", first.Id)).IsSuccess);
        Assert.True((await service.DismissAsync("user-1", first.Id)).IsSuccess);

        Assert.Collection(
            dispatcher.Requests,
            change =>
            {
                Assert.Equal("MarkRead", change.Action);
                Assert.Equal(first.Id.ToString(CultureInfo.InvariantCulture), change.EntityId);
            },
            change =>
            {
                Assert.Equal("Dismiss", change.Action);
                Assert.Equal(first.Id.ToString(CultureInfo.InvariantCulture), change.EntityId);
            });
        Assert.All(dispatcher.Requests, change =>
        {
            Assert.Equal("notifications", change.Resource);
            Assert.Equal(RealtimeAudienceKind.UserCompany, change.Audience.Kind);
            Assert.Equal("tenant-1", change.Audience.TenantId);
            Assert.Equal(1, change.Audience.CompanyId);
            Assert.Equal("user-1", change.Audience.UserId);
        });
    }

    [Theory]
    [InlineData("MarkAllRead")]
    [InlineData("MarkAllUnread")]
    [InlineData("DismissAll")]
    public void BulkNotificationStateChanges_UseNotificationsUserCompanyContract(string action)
    {
        using var context = CreateContext();
        var dispatcher = new RecordingRealtimeDispatcher();
        var service = CreateService(context, dispatcher);
        var dispatch = typeof(NotificationService).GetMethod(
            "DispatchChange",
            BindingFlags.Instance | BindingFlags.NonPublic);

        Assert.NotNull(dispatch);
        dispatch.Invoke(service, ["user-1", action, null]);

        var change = Assert.Single(dispatcher.Requests);
        Assert.Equal("notifications", change.Resource);
        Assert.Equal(action, change.Action);
        Assert.Null(change.EntityId);
        Assert.Equal(RealtimeAudienceKind.UserCompany, change.Audience.Kind);
        Assert.Equal("tenant-1", change.Audience.TenantId);
        Assert.Equal(1, change.Audience.CompanyId);
        Assert.Equal("user-1", change.Audience.UserId);
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

        var dispatcher = new RecordingRealtimeDispatcher();
        var service = CreateService(context, dispatcher);
        var first = await service.MarkUnreadAsync("user-1", notification.Id);
        var second = await service.MarkUnreadAsync("user-1", notification.Id);

        Assert.True(first.IsSuccess);
        Assert.True(second.IsSuccess);
        Assert.Null((await context.Notifications.SingleAsync(item => item.Id == notification.Id)).ReadOn);
        var change = Assert.Single(dispatcher.Requests);
        Assert.Equal("notifications", change.Resource);
        Assert.Equal("MarkUnread", change.Action);
        Assert.Equal(notification.Id.ToString(CultureInfo.InvariantCulture), change.EntityId);
        Assert.Equal(RealtimeAudienceKind.UserCompany, change.Audience.Kind);
        Assert.Equal("tenant-1", change.Audience.TenantId);
        Assert.Equal(1, change.Audience.CompanyId);
        Assert.Equal("user-1", change.Audience.UserId);
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
        var lockedUser = CreateUser("locked");
        lockedUser.LockoutEnd = DateTimeOffset.UtcNow.AddHours(1);

        context.Roles.AddRange(viewRole, otherRole);
        context.Users.AddRange(allowedUser, deniedUser, disabledUser, lockedUser);
        context.Companies.Add(new Company(
            "TEST",
            "Test Company",
            "Test Company",
            "EGP",
            "Africa/Cairo")
        {
            CreatedById = allowedUser.Id
        });
        context.UserCompanyAccesses.AddRange(
            CreateCompanyAccess(allowedUser.Id),
            CreateCompanyAccess(deniedUser.Id),
            CreateCompanyAccess(disabledUser.Id),
            CreateCompanyAccess(lockedUser.Id));
        context.UserRoles.AddRange(
            new IdentityUserRole<string> { UserId = allowedUser.Id, RoleId = viewRole.Id },
            new IdentityUserRole<string> { UserId = deniedUser.Id, RoleId = otherRole.Id },
            new IdentityUserRole<string> { UserId = disabledUser.Id, RoleId = viewRole.Id },
            new IdentityUserRole<string> { UserId = lockedUser.Id, RoleId = viewRole.Id });
        context.RoleClaims.Add(new IdentityRoleClaim<string>
        {
            RoleId = viewRole.Id,
            ClaimType = Permissions.Type,
            ClaimValue = Permissions.ViewCountries
        });
        await context.SaveChangesAsync();

        var publisher = CreatePublisher(context);

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
        return new ApplicationDbContext(options, new TestCurrentActor(), TimeProvider.System);
    }

    private static NotificationService CreateService(
        ApplicationDbContext context,
        RecordingRealtimeDispatcher? dispatcher = null)
    {
        var config = new TypeAdapterConfig();
        new NotificationMappingConfig().Register(config);
        return new NotificationService(
            context,
            CreateErrors(),
            new Mapper(config),
            new TestCurrentActor(),
            dispatcher ?? new RecordingRealtimeDispatcher());
    }

    private static NotificationPublisher CreatePublisher(ApplicationDbContext context)
    {
        var config = new TypeAdapterConfig();
        new NotificationMappingConfig().Register(config);
        var hubClient = DispatchProxy.Create<IGeneralHubClient, NoOpHubClientProxy>();

        return new NotificationPublisher(
            context,
            CreateErrors(),
            new TestHubContext(hubClient),
            new Mapper(config),
            NullLogger<NotificationPublisher>.Instance,
            TimeProvider.System);
    }

    private static NotificationErrors CreateErrors() => new(new TestStringLocalizer<NotificationQueryRequest>());

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => "tenant-1";
        public int? CompanyId => 1;
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Requests { get; } = [];

        public void Dispatch(RealtimeChangeRequest request) => Requests.Add(request);
    }

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

    private static ApplicationUser CreateUser(string id, bool isDisabled = false)
    {
        var user = new ApplicationUser
        {
            Id = id,
            UserName = id,
            FirstName = id,
            LastName = "User"
        };
        if (isDisabled)
            user.Disable();

        return user;
    }

    private static UserCompanyAccess CreateCompanyAccess(string userId) => new()
    {
        TenantId = "tenant-1",
        CompanyId = 1,
        UserId = userId
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

    private sealed class TestHubContext(IGeneralHubClient client)
        : IHubContext<GeneralHub, IGeneralHubClient>
    {
        public IHubClients<IGeneralHubClient> Clients { get; } = new TestHubClients(client);
        public IGroupManager Groups => null!;
    }

    private sealed class TestHubClients(IGeneralHubClient client) : IHubClients<IGeneralHubClient>
    {
        public IGeneralHubClient All => client;
        public IGeneralHubClient AllExcept(IReadOnlyList<string> excludedConnectionIds) => client;
        public IGeneralHubClient Client(string connectionId) => client;
        public IGeneralHubClient Clients(IReadOnlyList<string> connectionIds) => client;
        public IGeneralHubClient Group(string groupName) => client;
        public IGeneralHubClient GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => client;
        public IGeneralHubClient Groups(IReadOnlyList<string> groupNames) => client;
        public IGeneralHubClient User(string userId) => client;
        public IGeneralHubClient Users(IReadOnlyList<string> userIds) => client;
    }

    public class NoOpHubClientProxy : DispatchProxy
    {
        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) =>
            Task.CompletedTask;
    }

    private sealed class TestStringLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments));

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
