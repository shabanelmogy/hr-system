using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Application.Features.Security.Users.Contracts;
using HrManagementSystem.Domain.Catalog.Categories.Entities;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;
using Microsoft.AspNetCore.SignalR;

namespace HrManagementSystem.Tests;

public sealed class RealtimeEntityPublisherTests
{
    [Fact]
    public async Task PublishAsync_MapsCompanyPermissionWithoutCrossTenantBroadcast()
    {
        var client = new RecordingClient();
        var clients = new RecordingHubClients(client);
        var publisher = new SignalRRealtimeEntityPublisher(
            new TestHubContext(clients),
            TimeProvider.System);
        var eventId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        await publisher.PublishAsync(RealtimeChangeRequest.For<Category>(
            RealtimeAudience.ForCompanyPermission(
                "tenant-1",
                7,
                Permissions.ViewCategories),
            "Update",
            "42",
            eventId));

        Assert.Equal(
            "tenant:tenant-1:company:7:permission:Categories:View",
            clients.SelectedGroup);
        var change = Assert.Single(client.EntityChanges);
        Assert.Equal(eventId, change.EventId);
        Assert.Equal("categories", change.Resource);
        Assert.Equal("Update", change.Action);
        Assert.Equal("42", change.EntityId);
    }

    [Fact]
    public async Task PublishAsync_RejectsUnknownPermissions()
    {
        var publisher = new SignalRRealtimeEntityPublisher(
            new TestHubContext(new RecordingHubClients(new RecordingClient())),
            TimeProvider.System);
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
            TimeProvider.System);

        await publisher.PublishAsync(RealtimeChangeRequest.For<Tenant>(
            RealtimeAudience.ForTenant("tenant-1"),
            "Archive",
            "tenant-1"));

        Assert.Equal("tenant:tenant-1", clients.SelectedGroup);
        Assert.Equal("tenants", Assert.Single(client.EntityChanges).Resource);
    }

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

        public Task ReceiveUserUpdate(Result<UserChangedResponse> usersUpdate) => Task.CompletedTask;
        public Task ReceiveCountryUpdate(CountriesCountResponse countriesCount) => Task.CompletedTask;
        public Task ReceiveStateUpdate(StatesCountResponse statesCount) => Task.CompletedTask;
        public Task ReceiveDistrictUpdate(Result<DistrictsCountResponse> districtsCount) => Task.CompletedTask;
        public Task ReceiveAddressTypeUpdate(Result<AddressTypesCountResponse> addressTypesCount) => Task.CompletedTask;
        public Task ReceiveAddressUpdate(Result<AddressesCountResponse> addressesCount) => Task.CompletedTask;
        public Task ReceiveTokenRevoked(string message) => Task.CompletedTask;
        public Task ReceiveNotification(NotificationRealtimeResponse notification) => Task.CompletedTask;
    }
}
