using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Contracts;
using ErpSystem.Modules.Platform.Infrastructure.Realtime;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Reflection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class RealtimeEntityPublisherTests
{
    [Fact]
    public async Task PublishAsync_MapsCompanyPermissionWithoutCrossTenantBroadcast()
    {
        var client = new RecordingClient();
        var clients = new RecordingHubClients(client);
        var publisher = new SignalRRealtimeEntityPublisher(
            new TestHubContext(clients),
            TimeProvider.System,
            new TestModuleCatalogPolicy(PlatformPermissions.ViewRoles));
        var eventId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        await publisher.PublishAsync(new RealtimeChangeRequest(
            RealtimeAudience.ForCompanyPermission(
                "tenant-1",
                7,
                PlatformPermissions.ViewRoles),
            "roles",
            "Update",
            "42",
            eventId));

        Assert.Equal(
            $"tenant:tenant-1:company:7:permission:{PlatformPermissions.ViewRoles}",
            clients.SelectedGroup);
        var change = Assert.Single(client.EntityChanges);
        Assert.Equal(eventId, change.EventId);
        Assert.Equal("roles", change.Resource);
        Assert.Equal("Update", change.Action);
        Assert.Equal("42", change.EntityId);
    }

    [Fact]
    public async Task PublishAsync_RejectsUnknownPermissions()
    {
        var publisher = new SignalRRealtimeEntityPublisher(
            new TestHubContext(new RecordingHubClients(new RecordingClient())),
            TimeProvider.System,
            new TestModuleCatalogPolicy(PlatformPermissions.ViewRoles));
        var request = new RealtimeChangeRequest(
            new RealtimeAudience(RealtimeAudienceKind.Permission, Permission: "Unknown:View"),
            "unknowns",
            "Update",
            null,
            Guid.NewGuid());

        await Assert.ThrowsAsync<ArgumentException>(() => publisher.PublishAsync(request));
    }

    [Fact]
    public async Task PublishAsync_MapsTenantAudienceWithoutCrossTenantBroadcast()
    {
        var client = new RecordingClient();
        var clients = new RecordingHubClients(client);
        var publisher = new SignalRRealtimeEntityPublisher(
            new TestHubContext(clients),
            TimeProvider.System,
            new TestModuleCatalogPolicy(PlatformPermissions.ViewRoles));

        await publisher.PublishAsync(new RealtimeChangeRequest(
            RealtimeAudience.ForTenant("tenant-1"),
            "tenants",
            "Archive",
            "tenant-1",
            Guid.NewGuid()));

        Assert.Equal("tenant:tenant-1", clients.SelectedGroup);
        Assert.Equal("tenants", Assert.Single(client.EntityChanges).Resource);
    }

    [Theory]
    [InlineData("tenant-1", "tenant:tenant-1:permission:Roles:View")]
    [InlineData("tenant-2", "tenant:tenant-2:permission:Roles:View")]
    public async Task PublishAsync_MapsTenantPermissionWithoutSamePermissionCollision(
        string tenantId,
        string expectedGroup)
    {
        var client = new RecordingClient();
        var clients = new RecordingHubClients(client);
        var publisher = new SignalRRealtimeEntityPublisher(
            new TestHubContext(clients),
            TimeProvider.System,
            new TestModuleCatalogPolicy(PlatformPermissions.ViewRoles));

        await publisher.PublishAsync(new RealtimeChangeRequest(
            RealtimeAudience.ForTenantPermission(tenantId, PlatformPermissions.ViewRoles),
            "role-claims",
            "Update",
            "role-id",
            Guid.NewGuid()));

        Assert.Equal(expectedGroup, clients.SelectedGroup);
    }

    [Fact]
    public void ResolveGroups_UsesTenantRoleIdsAndKeepsOnlySystemRoleNamesGlobal()
    {
        var tenantOne = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(PermissionClaimNames.Permission, PlatformPermissions.ViewRoles),
            new Claim(ClaimTypes.Role, "manager"),
            new Claim(AuthenticationTokenClaimNames.TenantRoleId, "role-tenant-1")
        ]));
        var tenantTwo = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(PermissionClaimNames.Permission, PlatformPermissions.ViewRoles),
            new Claim(ClaimTypes.Role, "manager"),
            new Claim(AuthenticationTokenClaimNames.TenantRoleId, "role-tenant-2")
        ]));

        var tenantOneGroups = ResolveGroups(tenantOne, "user-1", "tenant-1", 7);
        var tenantTwoGroups = ResolveGroups(tenantTwo, "user-2", "tenant-2", 7);

        Assert.Contains(GeneralHubGroups.ForPermission(PlatformPermissions.ViewRoles), tenantOneGroups);
        Assert.Contains(GeneralHubGroups.ForPermission(PlatformPermissions.ViewRoles), tenantTwoGroups);
        Assert.Contains(
            GeneralHubGroups.ForTenantPermission("tenant-1", PlatformPermissions.ViewRoles),
            tenantOneGroups);
        Assert.DoesNotContain(
            GeneralHubGroups.ForTenantPermission("tenant-1", PlatformPermissions.ViewRoles),
            tenantTwoGroups);
        Assert.Contains(
            GeneralHubGroups.ForTenantRole("tenant-1", "role-tenant-1"),
            tenantOneGroups);
        Assert.Contains(
            GeneralHubGroups.ForTenantRole("tenant-2", "role-tenant-2"),
            tenantTwoGroups);
        Assert.DoesNotContain(GeneralHubGroups.ForRole("manager"), tenantOneGroups);
        Assert.DoesNotContain(GeneralHubGroups.ForRole("manager"), tenantTwoGroups);

        var superAdmin = new ClaimsPrincipal(new ClaimsIdentity(
        [new Claim(ClaimTypes.Role, PlatformRoleNames.SuperAdmin)]));
        var systemGroups = ResolveGroups(superAdmin, "platform-user", "tenant-1", 7);
        Assert.Contains(GeneralHubGroups.ForRole(PlatformRoleNames.SuperAdmin), systemGroups);
    }

    private static IReadOnlyCollection<string> ResolveGroups(
        ClaimsPrincipal principal,
        string userId,
        string tenantId,
        int companyId) =>
        Assert.IsAssignableFrom<IReadOnlyCollection<string>>(
            typeof(GeneralHub)
                .GetMethod(
                    "ResolveGroups",
                    BindingFlags.Static | BindingFlags.NonPublic)!
                .Invoke(null,
                [
                    principal,
                    userId,
                    tenantId,
                    companyId,
                    new HashSet<string>([PlatformPermissions.ViewRoles], StringComparer.Ordinal)
                ]));

    private sealed class TestHubContext(IHubClients<IGeneralHubClient> clients)
        : IHubContext<GeneralHub, IGeneralHubClient>
    {
        public IHubClients<IGeneralHubClient> Clients { get; } = clients;
        public IGroupManager Groups => null!;
    }

    private sealed class RecordingHubClients(IGeneralHubClient client)
        : IHubClients<IGeneralHubClient>
    {
        public string? SelectedGroup { get; private set; }
        public IGeneralHubClient All => client;
        public IGeneralHubClient AllExcept(IReadOnlyList<string> excludedConnectionIds) => client;
        public IGeneralHubClient Client(string connectionId) => client;
        public IGeneralHubClient Clients(IReadOnlyList<string> connectionIds) => client;
        public IGeneralHubClient Group(string groupName)
        {
            SelectedGroup = groupName;
            return client;
        }
        public IGeneralHubClient GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => client;
        public IGeneralHubClient Groups(IReadOnlyList<string> groupNames) => client;
        public IGeneralHubClient User(string userId) => client;
        public IGeneralHubClient Users(IReadOnlyList<string> userIds) => client;
    }

    private sealed class RecordingClient : IGeneralHubClient
    {
        public List<RealtimeEntityChanged> EntityChanges { get; } = [];

        public Task ReceiveEntityChanged(RealtimeEntityChanged change)
        {
            EntityChanges.Add(change);
            return Task.CompletedTask;
        }

        public Task ReceiveTokenRevoked(string message) => Task.CompletedTask;
        public Task ReceiveNotification(NotificationRealtimeResponse notification) => Task.CompletedTask;
    }

    private sealed class TestModuleCatalogPolicy(params string[] knownPermissions) : IModuleCatalogPolicy
    {
        private readonly HashSet<string> _knownPermissions =
            new HashSet<string>(knownPermissions, StringComparer.Ordinal);

        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [];

        public IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog() => [];

        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() => [];

        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([]);

        public IReadOnlySet<string> GetKnownPermissions() => _knownPermissions;

        public IReadOnlySet<string> GetTenantAssignablePermissions() => _knownPermissions;

        public bool TryResolvePermission(
            string permission,
            out ModulePermissionCatalogItem resolvedPermission)
        {
            resolvedPermission = new ModulePermissionCatalogItem(permission, "platform", "platform", true, false);
            return _knownPermissions.Contains(permission);
        }

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) => Task.FromResult(false);

        public bool IsValidEntitlement(
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            out string? invalidCode)
        {
            invalidCode = null;
            return true;
        }
    }
}

