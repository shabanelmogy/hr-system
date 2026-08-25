using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Mapping;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Persistence;
using HrManagementSystem.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class DistrictBulkCreateHandlerTests
{
    [Fact]
    public async Task BulkCreate_AllowsCrossFieldValuesAndSchedulesAfterCommit()
    {
        var lifecycle = new List<string>();
        var store = new RecordingDistrictWriteStore(lifecycle);
        var scheduler = new RecordingDistrictScheduler(lifecycle);
        var unitOfWork = new RecordingUnitOfWork(lifecycle);
        var handler = CreateHandler(store, unitOfWork, scheduler);

        var result = await handler.Handle(new CreateDistrictsCommand(
        [
            Request("المعادي", "Maadi", "MAA", 1),
            Request("الزمالك", "Zamalek", "MAADI", 2)
        ]), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.CreatedCount);
        Assert.Equal(["add-range", "save", "schedule"], lifecycle);
        Assert.Equal(
            [GeographicalLifecycleLocks.State(1), GeographicalLifecycleLocks.State(2)],
            Assert.Single(unitOfWork.AtomicLockResources));
        var change = Assert.Single(scheduler.Changes);
        Assert.Equal("BulkAdd", change.Action);
        Assert.Equal(2, change.BulkCount);
    }

    [Fact]
    public async Task BulkCreate_RejectsSameFieldDuplicatesCaseInsensitivelyWithinState()
    {
        var lifecycle = new List<string>();
        var scheduler = new RecordingDistrictScheduler(lifecycle);
        var handler = CreateHandler(
            new RecordingDistrictWriteStore(lifecycle),
            new RecordingUnitOfWork(lifecycle),
            scheduler);

        var result = await handler.Handle(new CreateDistrictsCommand(
        [
            Request("المعادي", "Maadi", "MAA", 1),
            Request("الزمالك", " maadi ", "ZAM", 1)
        ]), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("District.Duplicated", result.Error.Code);
        Assert.Empty(lifecycle);
        Assert.Empty(scheduler.Changes);
    }

    [Fact]
    public async Task BulkCreate_RejectsAnInactiveStateWithoutWritingOrScheduling()
    {
        var lifecycle = new List<string>();
        var store = new RecordingDistrictWriteStore(lifecycle) { StatesAreActive = false };
        var scheduler = new RecordingDistrictScheduler(lifecycle);
        var unitOfWork = new RecordingUnitOfWork(lifecycle);
        var handler = CreateHandler(store, unitOfWork, scheduler);

        var result = await handler.Handle(
            new CreateDistrictsCommand([Request("المعادي", "Maadi", "MAA", 7)]),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("District.StateNotFound", result.Error.Code);
        Assert.Empty(lifecycle);
        Assert.Empty(scheduler.Changes);
        Assert.Equal(
            [GeographicalLifecycleLocks.State(7)],
            Assert.Single(unitOfWork.AtomicLockResources));
    }

    [Fact]
    public async Task WriteStore_UsesCaseInsensitiveFieldScopedConflictChecks()
    {
        await using var context = CreateContext();
        context.Countries.Add(new Country { Id = 1, NameAr = "مصر", NameEn = "Egypt" });
        context.States.Add(new State
        {
            Id = 1,
            CountryId = 1,
            NameAr = "القاهرة",
            NameEn = "Cairo",
            Code = "CAI"
        });
        context.Districts.Add(new District
        {
            Id = 1,
            StateId = 1,
            NameAr = "المعادي",
            NameEn = "Maadi",
            Code = "MAA"
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var store = new DistrictWriteStore(context);

        var caseOnlyConflict = await store.HasAnyConflictAsync(
        [
            new District { StateId = 1, NameAr = "الزمالك", NameEn = "MAADI", Code = "ZAM" }
        ], CancellationToken.None);
        var crossFieldValue = await store.HasAnyConflictAsync(
        [
            new District { StateId = 1, NameAr = "الزمالك", NameEn = "Zamalek", Code = "MAADI" }
        ], CancellationToken.None);
        var sameValueOtherState = await store.HasAnyConflictAsync(
        [
            new District { StateId = 2, NameAr = "المعادي", NameEn = "Maadi", Code = "MAA" }
        ], CancellationToken.None);

        Assert.True(caseOnlyConflict);
        Assert.False(crossFieldValue);
        Assert.False(sameValueOtherState);
    }

    private static CreateDistrictsCommandHandler CreateHandler(
        IDistrictWriteStore store,
        IUnitOfWork unitOfWork,
        IDistrictChangeScheduler scheduler) =>
        new(store, unitOfWork, scheduler, new TestCurrentActor(), CreateMapper(), CreateErrors());

    private static CreateDistrictRequest Request(string nameAr, string nameEn, string code, int stateId) =>
        new(nameAr, nameEn, code, stateId);

    private static IMapper CreateMapper()
    {
        var config = new TypeAdapterConfig();
        new DistrictMappingConfig().Register(config);
        return new Mapper(config);
    }

    private static DistrictErrors CreateErrors() => new(new EchoLocalizer<CreateDistrictRequest>());

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new TestCurrentActor(), TimeProvider.System);
    }

    private sealed class RecordingDistrictWriteStore(List<string> lifecycle) : IDistrictWriteStore
    {
        public bool StatesAreActive { get; init; } = true;

        public void Add(District district) => lifecycle.Add("add");
        public void AddRange(IReadOnlyCollection<District> districts) => lifecycle.Add("add-range");
        public Task<District?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult<District?>(null);
        public Task<IReadOnlyList<District>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<District>>([]);
        public Task<int?> GetStateIdAsync(int districtId, CancellationToken cancellationToken) => Task.FromResult<int?>(null);
        public Task<IReadOnlyDictionary<int, int>> GetStateIdsAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<int, int>>(new Dictionary<int, int>());
        public Task<bool> IsStateActiveAsync(int stateId, CancellationToken cancellationToken) => Task.FromResult(StatesAreActive);
        public Task<bool> AreStatesActiveAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken) => Task.FromResult(StatesAreActive);
        public Task<bool> HasConflictAsync(District candidate, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasAnyConflictAsync(IReadOnlyCollection<District> districts, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasActiveAddressesAsync(int districtId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken) => Task.FromResult(false);
    }

    private sealed class RecordingUnitOfWork(List<string> lifecycle) : IUnitOfWork
    {
        public List<IReadOnlyCollection<string>> AtomicLockResources { get; } = [];

        public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default)
        {
            AtomicLockResources.Add(lockResources);
            return await operation(cancellationToken);
        }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            lifecycle.Add("save");
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingDistrictScheduler(List<string> lifecycle) : IDistrictChangeScheduler
    {
        public List<DistrictChange> Changes { get; } = [];

        public void Schedule(DistrictChange change)
        {
            lifecycle.Add("schedule");
            Changes.Add(change);
        }
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "actor-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 1;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
