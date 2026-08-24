using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Mapping;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Persistence;
using HrManagementSystem.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class StateBulkCreateHandlerTests
{
    [Fact]
    public async Task BulkCreate_AllowsCrossFieldValuesAndSchedulesAfterCommit()
    {
        var lifecycle = new List<string>();
        var store = new RecordingStateWriteStore(lifecycle);
        var scheduler = new RecordingStateScheduler(lifecycle);
        var handler = CreateHandler(store, new RecordingUnitOfWork(lifecycle), scheduler);

        var result = await handler.Handle(new CreateStatesCommand(
        [
            Request("دلتا", "Delta", "DLT"),
            Request("القاهرة", "Cairo", "DELTA")
        ]), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.CreatedCount);
        Assert.Equal(["add-range", "save", "schedule"], lifecycle);
        Assert.Equal("BulkAdd", Assert.Single(scheduler.Changes).Action);
    }

    [Fact]
    public async Task BulkCreate_RejectsSameFieldDuplicatesCaseInsensitively()
    {
        var lifecycle = new List<string>();
        var store = new RecordingStateWriteStore(lifecycle);
        var scheduler = new RecordingStateScheduler(lifecycle);
        var handler = CreateHandler(store, new RecordingUnitOfWork(lifecycle), scheduler);

        var result = await handler.Handle(new CreateStatesCommand(
        [
            Request("دلتا", "Delta", "DLT"),
            Request("القاهرة", " delta ", "CAI")
        ]), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("State.Duplicated", result.Error.Code);
        Assert.Empty(lifecycle);
        Assert.Empty(scheduler.Changes);
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
            NameAr = "دلتا",
            NameEn = "Delta",
            Code = "DLT"
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var store = new StateWriteStore(context);

        var caseOnlyConflict = await store.HasAnyConflictAsync(
        [
            new State { CountryId = 1, NameAr = "القاهرة", NameEn = "DELTA", Code = "CAI" }
        ], CancellationToken.None);
        var crossFieldValue = await store.HasAnyConflictAsync(
        [
            new State { CountryId = 1, NameAr = "القاهرة", NameEn = "Cairo", Code = "DELTA" }
        ], CancellationToken.None);

        Assert.True(caseOnlyConflict);
        Assert.False(crossFieldValue);
    }

    private static CreateStatesCommandHandler CreateHandler(
        IStateWriteStore store,
        IUnitOfWork unitOfWork,
        IStateChangeScheduler scheduler) =>
        new(store, unitOfWork, scheduler, new TestCurrentActor(), CreateMapper(), CreateErrors());

    private static CreateStateRequest Request(string nameAr, string nameEn, string code) =>
        new(nameAr, nameEn, code, 1);

    private static IMapper CreateMapper()
    {
        var config = new TypeAdapterConfig();
        new StateMappingConfig().Register(config);
        return new Mapper(config);
    }

    private static StateErrors CreateErrors() => new(new EchoLocalizer<CreateStateRequest>());

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new TestCurrentActor(), TimeProvider.System);
    }

    private sealed class RecordingStateWriteStore(List<string> lifecycle) : IStateWriteStore
    {
        public void Add(State state) => lifecycle.Add("add");
        public void AddRange(IReadOnlyCollection<State> states) => lifecycle.Add("add-range");
        public Task<State?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult<State?>(null);
        public Task<IReadOnlyList<State>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<State>>([]);
        public Task<bool> HasConflictAsync(State candidate, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasAnyConflictAsync(IReadOnlyCollection<State> states, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> AreCountriesActiveAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken) => Task.FromResult(true);
        public Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken) => Task.FromResult(true);
        public Task<bool> HasActiveDistrictsAsync(int stateId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasActiveDistrictsAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken) => Task.FromResult(false);
    }

    private sealed class RecordingUnitOfWork(List<string> lifecycle) : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            lifecycle.Add("save");
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingStateScheduler(List<string> lifecycle) : IStateChangeScheduler
    {
        public List<StateChange> Changes { get; } = [];

        public void Schedule(StateChange change)
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
