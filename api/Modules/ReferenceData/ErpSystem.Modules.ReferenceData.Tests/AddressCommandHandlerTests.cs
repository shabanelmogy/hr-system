using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Commands;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Errors;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class AddressCommandHandlerTests
{
    [Fact]
    public async Task Create_RejectsCountryOutsideCompanyScope_WithoutPersistingOrScheduling()
    {
        var store = new FakeAddressStore();
        var scheduler = new RecordingScheduler();
        var handler = new CreateAddressCommandHandler(
            store,
            store,
            new ImmediateUnitOfWork(),
            new StubCompanyGeography(false),
            scheduler,
            new TestActor(),
            CreateErrors());

        var result = await handler.Handle(new CreateAddressCommand(Request()), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.CountryOutsideOperatingScope", result.Error.Code);
        Assert.Null(store.Added);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Create_RejectsArchivedAddressType_WithoutPersistingOrScheduling()
    {
        var store = new FakeAddressStore { AddressTypeActive = false };
        var scheduler = new RecordingScheduler();
        var handler = new CreateAddressCommandHandler(
            store,
            store,
            new ImmediateUnitOfWork(),
            new StubCompanyGeography(true),
            scheduler,
            new TestActor(),
            CreateErrors());

        var result = await handler.Handle(new CreateAddressCommand(Request()), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.InvalidAddressType", result.Error.Code);
        Assert.Null(store.Added);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Update_RejectsCountryOutsideCompanyScope_WithoutMutatingAddress()
    {
        var address = Entity();
        var store = new FakeAddressStore
        {
            Existing = address,
            Snapshot = new AddressLifecycleSnapshot(
                address.AddressTypeId,
                address.CountryId,
                address.StateId,
                address.DistrictId,
                false)
        };
        var scheduler = new RecordingScheduler();
        var handler = new UpdateAddressCommandHandler(
            store,
            store,
            new ImmediateUnitOfWork(),
            new StubCompanyGeography(false),
            new NoopAuditTrail(),
            scheduler,
            new TestActor(),
            CreateErrors());
        var request = Request() with { Id = address.Id, CountryId = 2, City = "Alexandria" };

        var result = await handler.Handle(new UpdateAddressCommand(request), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.CountryOutsideOperatingScope", result.Error.Code);
        Assert.Equal(1, address.CountryId);
        Assert.Equal("Cairo", address.City);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Toggle_RejectsDeletingAddressThatIsLinkedToOwner()
    {
        var address = Entity();
        var store = new FakeAddressStore
        {
            Existing = address,
            Snapshot = new AddressLifecycleSnapshot(
                address.AddressTypeId,
                address.CountryId,
                address.StateId,
                address.DistrictId,
                false),
            LinkedToOwner = true
        };
        var scheduler = new RecordingScheduler();
        var handler = new ToggleAddressCommandHandler(
            store,
            new ImmediateUnitOfWork(),
            new StubCompanyGeography(true),
            scheduler,
            new TestActor(),
            TimeProvider.System,
            CreateErrors());

        var result = await handler.Handle(new ToggleAddressCommand(address.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.AddressInUseByOtherEntities", result.Error.Code);
        Assert.False(address.IsDeleted);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Toggle_Restore_RevalidatesParentHierarchyBeforeChangingState()
    {
        var address = Entity();
        address.IsDeleted = true;
        address.StateId = 5;
        var store = new FakeAddressStore
        {
            Existing = address,
            Snapshot = new AddressLifecycleSnapshot(
                address.AddressTypeId,
                address.CountryId,
                address.StateId,
                address.DistrictId,
                true),
            StateActive = false
        };
        var scheduler = new RecordingScheduler();
        var handler = new ToggleAddressCommandHandler(
            store,
            new ImmediateUnitOfWork(),
            new StubCompanyGeography(true),
            scheduler,
            new TestActor(),
            TimeProvider.System,
            CreateErrors());

        var result = await handler.Handle(new ToggleAddressCommand(address.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.InvalidState", result.Error.Code);
        Assert.True(address.IsDeleted);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task Toggle_Restore_RejectsCountryRemovedFromCompanyScope()
    {
        var address = Entity();
        address.IsDeleted = true;
        var store = new FakeAddressStore
        {
            Existing = address,
            Snapshot = new AddressLifecycleSnapshot(
                address.AddressTypeId,
                address.CountryId,
                address.StateId,
                address.DistrictId,
                true)
        };
        var scheduler = new RecordingScheduler();
        var handler = new ToggleAddressCommandHandler(
            store,
            new ImmediateUnitOfWork(),
            new StubCompanyGeography(false),
            scheduler,
            new TestActor(),
            TimeProvider.System,
            CreateErrors());

        var result = await handler.Handle(new ToggleAddressCommand(address.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.CountryOutsideOperatingScope", result.Error.Code);
        Assert.True(address.IsDeleted);
        Assert.Empty(scheduler.Changes);
    }

    private static AddressRequest Request() => new(
        0, 1, null, null, " Cairo ", " 10 Tahrir ", null, "10", null, null,
        null, null, null, null, 3);

    private static Address Entity() => new()
    {
        Id = 9,
        TenantId = "tenant-1",
        CompanyId = 11,
        CountryId = 1,
        AddressTypeId = 3,
        City = "Cairo"
    };

    private static AddressErrors CreateErrors() => new(new EchoLocalizer<AddressRequest>());

    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
    }

    private sealed class StubCompanyGeography(bool inScope) : ICompanyGeographySource
    {
        public Task<bool> HasCompanyUsageAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<bool> IsCountryInScopeAsync(string tenantId, int companyId, int countryId, CancellationToken cancellationToken = default) =>
            Task.FromResult(inScope);
    }

    private sealed class RecordingScheduler : IAddressChangeScheduler
    {
        public List<AddressChange> Changes { get; } = [];
        public void Schedule(AddressChange change) => Changes.Add(change);
    }

    private sealed class NoopAuditTrail : IAddressAuditTrail
    {
        public Task RecordUpdateAsync(Address existingAddress, Address updatedAddress, CancellationToken cancellationToken) =>
            Task.CompletedTask;
    }

    private sealed class ImmediateUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => Task.FromResult(1);

        public Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default) => operation(cancellationToken);
    }

    private sealed class FakeAddressStore : IAddressReadStore, IAddressWriteStore
    {
        public Address? Added { get; private set; }
        public Address? Existing { get; init; }
        public AddressLifecycleSnapshot? Snapshot { get; init; }
        public bool LinkedToOwner { get; init; }
        public bool CountryActive { get; init; } = true;
        public bool StateActive { get; init; } = true;
        public bool DistrictActive { get; init; } = true;
        public bool AddressTypeActive { get; init; } = true;

        public void Add(Address address) => Added = address;
        public Task<AddressLifecycleSnapshot?> GetSnapshotAsync(int id, CancellationToken cancellationToken) => Task.FromResult(Snapshot);
        public Task<Address?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult(Existing);
        public Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken) => Task.FromResult(CountryActive);
        public Task<bool> IsStateActiveInCountryAsync(int stateId, int countryId, CancellationToken cancellationToken) => Task.FromResult(StateActive);
        public Task<bool> IsDistrictActiveInHierarchyAsync(int districtId, int? stateId, int countryId, CancellationToken cancellationToken) => Task.FromResult(DistrictActive);
        public Task<bool> IsAddressTypeActiveAsync(int addressTypeId, CancellationToken cancellationToken) => Task.FromResult(AddressTypeActive);
        public Task<bool> IsLinkedToOwnerAsync(int addressId, CancellationToken cancellationToken) => Task.FromResult(LinkedToOwner);
        public Task<IReadOnlyList<AddressResponse>> GetAllAsync(CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<AddressResponse>>([]);
        public Task<AddressResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) => Task.FromResult<AddressResponse?>(null);
        public Task<AddressResponse?> GetWithDetailsAsync(int id, CancellationToken cancellationToken) => Task.FromResult<AddressResponse?>(null);
        public Task<int> CountActiveAsync(CancellationToken cancellationToken) => Task.FromResult(0);
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] => new(name, string.Format(name, arguments), true);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
