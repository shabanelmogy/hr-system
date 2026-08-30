using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Mapping;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Queries;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Mapping;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class GeographicParentReassignmentHandlerTests
{
    [Fact]
    public async Task StateUpdate_AllowsSameCountryRenameWhenDependenciesExist()
    {
        var state = CreateState(countryId: 1);
        var store = new RecordingStateWriteStore(state) { HasActiveDistricts = true, HasActiveAddresses = true };
        var unitOfWork = new RecordingUnitOfWork();
        var scheduler = new RecordingStateScheduler();
        var handler = new UpdateStateCommandHandler(
            store,
            new RecordingStateReadStore(state),
            unitOfWork,
            scheduler,
            new RecordingStateAuditTrail(),
            new TestCurrentActor(),
            CreateStateMapper(),
            CreateStateErrors());

        var result = await handler.Handle(
            new UpdateStateCommand(state.Id, "القاهرة الجديدة", "New Cairo", "NCA", state.CountryId),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("New Cairo", state.NameEn);
        Assert.Equal("NCA", state.Code);
        Assert.Equal(state.CountryId, result.Value.Country.Id);
        Assert.Equal(1, unitOfWork.SaveCount);
        Assert.Single(scheduler.Changes);
    }

    [Theory]
    [InlineData(true, false, "State.StateInUseByDistrict")]
    [InlineData(false, true, "State.StateInUseByAddress")]
    public async Task StateUpdate_BlocksCountryReassignmentWhenDependenciesExist(
        bool hasActiveDistricts,
        bool hasActiveAddresses,
        string expectedErrorCode)
    {
        var state = CreateState(countryId: 1);
        var store = new RecordingStateWriteStore(state)
        {
            HasActiveDistricts = hasActiveDistricts,
            HasActiveAddresses = hasActiveAddresses
        };
        var unitOfWork = new RecordingUnitOfWork();
        var scheduler = new RecordingStateScheduler();
        var handler = new UpdateStateCommandHandler(
            store,
            new RecordingStateReadStore(state),
            unitOfWork,
            scheduler,
            new RecordingStateAuditTrail(),
            new TestCurrentActor(),
            CreateStateMapper(),
            CreateStateErrors());

        var result = await handler.Handle(
            new UpdateStateCommand(state.Id, "القاهرة", "Cairo", "CAI", CountryId: 2),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(expectedErrorCode, result.Error.Code);
        Assert.Equal(1, state.CountryId);
        Assert.Equal(0, unitOfWork.SaveCount);
        Assert.Empty(scheduler.Changes);
        Assert.Equal(
            [GeographicalLifecycleLocks.Country(1), GeographicalLifecycleLocks.Country(2)],
            Assert.Single(unitOfWork.AtomicLockResources));
    }

    [Fact]
    public async Task DistrictUpdate_AllowsSameStateRenameWhenAddressesExist()
    {
        var district = CreateDistrict(stateId: 1);
        var store = new RecordingDistrictWriteStore(district) { HasActiveAddresses = true };
        var unitOfWork = new RecordingUnitOfWork();
        var scheduler = new RecordingDistrictScheduler();
        var handler = new UpdateDistrictCommandHandler(
            store,
            new RecordingDistrictReadStore(district),
            unitOfWork,
            scheduler,
            new RecordingDistrictAuditTrail(),
            new TestCurrentActor(),
            CreateDistrictMapper(),
            CreateDistrictErrors());

        var result = await handler.Handle(
            new UpdateDistrictCommand(district.Id, "المعادي الجديدة", "New Maadi", "NMA", district.StateId),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("New Maadi", district.NameEn);
        Assert.Equal("NMA", district.Code);
        Assert.Equal(district.StateId, result.Value.State.Id);
        Assert.Equal(1, unitOfWork.SaveCount);
        Assert.Single(scheduler.Changes);
    }

    [Fact]
    public async Task DistrictUpdate_BlocksStateReassignmentWhenAddressesExist()
    {
        var district = CreateDistrict(stateId: 1);
        var store = new RecordingDistrictWriteStore(district) { HasActiveAddresses = true };
        var unitOfWork = new RecordingUnitOfWork();
        var scheduler = new RecordingDistrictScheduler();
        var handler = new UpdateDistrictCommandHandler(
            store,
            new RecordingDistrictReadStore(district),
            unitOfWork,
            scheduler,
            new RecordingDistrictAuditTrail(),
            new TestCurrentActor(),
            CreateDistrictMapper(),
            CreateDistrictErrors());

        var result = await handler.Handle(
            new UpdateDistrictCommand(district.Id, "المعادي", "Maadi", "MAA", StateId: 2),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("District.DistrictInUseByAddress", result.Error.Code);
        Assert.Equal(1, district.StateId);
        Assert.Equal(0, unitOfWork.SaveCount);
        Assert.Empty(scheduler.Changes);
        Assert.Equal(
            [GeographicalLifecycleLocks.State(1), GeographicalLifecycleLocks.State(2)],
            Assert.Single(unitOfWork.AtomicLockResources));
    }

    private static State CreateState(int countryId) => new()
    {
        Id = 11,
        CountryId = countryId,
        Country = new Country { Id = countryId, NameAr = "مصر", NameEn = "Egypt" },
        NameAr = "القاهرة",
        NameEn = "Cairo",
        Code = "CAI"
    };

    private static District CreateDistrict(int stateId) => new()
    {
        Id = 21,
        StateId = stateId,
        State = CreateState(stateId),
        NameAr = "المعادي",
        NameEn = "Maadi",
        Code = "MAA"
    };

    private static IMapper CreateStateMapper()
    {
        var config = new TypeAdapterConfig();
        new StateMappingConfig().Register(config);
        return new Mapper(config);
    }

    private static IMapper CreateDistrictMapper()
    {
        var config = new TypeAdapterConfig();
        new DistrictMappingConfig().Register(config);
        return new Mapper(config);
    }

    private static StateErrors CreateStateErrors() => new(new EchoLocalizer<CreateStateRequest>());

    private static DistrictErrors CreateDistrictErrors() => new(new EchoLocalizer<CreateDistrictRequest>());

    private sealed class RecordingStateWriteStore(State state) : IStateWriteStore
    {
        public bool HasActiveDistricts { get; init; }
        public bool HasActiveAddresses { get; init; }

        public void Add(State item) { }
        public void AddRange(IReadOnlyCollection<State> items) { }
        public Task<State?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult<State?>(state);
        public Task<IReadOnlyList<State>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<State>>([state]);
        public Task<int?> GetCountryIdAsync(int stateId, CancellationToken cancellationToken) => Task.FromResult<int?>(state.CountryId);
        public Task<bool> HasConflictAsync(State candidate, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasAnyConflictAsync(IReadOnlyCollection<State> states, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> AreCountriesActiveAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken) => Task.FromResult(true);
        public Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken) => Task.FromResult(true);
        public Task<bool> HasActiveDistrictsAsync(int stateId, CancellationToken cancellationToken) => Task.FromResult(HasActiveDistricts);
        public Task<bool> HasActiveDistrictsAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken) => Task.FromResult(HasActiveDistricts);
        public Task<bool> HasActiveAddressesAsync(int stateId, CancellationToken cancellationToken) => Task.FromResult(HasActiveAddresses);
        public Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken) => Task.FromResult(HasActiveAddresses);
    }

    private sealed class RecordingDistrictWriteStore(District district) : IDistrictWriteStore
    {
        public bool HasActiveAddresses { get; init; }

        public void Add(District item) { }
        public void AddRange(IReadOnlyCollection<District> items) { }
        public Task<District?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => Task.FromResult<District?>(district);
        public Task<IReadOnlyList<District>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<District>>([district]);
        public Task<int?> GetStateIdAsync(int districtId, CancellationToken cancellationToken) => Task.FromResult<int?>(district.StateId);
        public Task<IReadOnlyDictionary<int, int>> GetStateIdsAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<int, int>>(new Dictionary<int, int> { [district.Id] = district.StateId });
        public Task<bool> IsStateActiveAsync(int stateId, CancellationToken cancellationToken) => Task.FromResult(true);
        public Task<bool> AreStatesActiveAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken) => Task.FromResult(true);
        public Task<bool> HasConflictAsync(District candidate, int? excludedId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasAnyConflictAsync(IReadOnlyCollection<District> districts, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<bool> HasActiveAddressesAsync(int districtId, CancellationToken cancellationToken) => Task.FromResult(HasActiveAddresses);
        public Task<bool> HasActiveAddressesAsync(IReadOnlyCollection<int> districtIds, CancellationToken cancellationToken) => Task.FromResult(HasActiveAddresses);
    }

    private sealed class RecordingStateReadStore(State state) : IStateReadStore
    {
        public Task<PageResponse<StateListItemResponse>> GetPageAsync(GetStatesQuery query, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public Task<StateDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<StateDetailResponse?>(new(
                state.Id,
                state.NameAr,
                state.NameEn,
                state.Code,
                state.CountryId,
                new SimpleCountryResponse(state.CountryId, "مصر", "Egypt", false),
                state.CreatedOn,
                state.UpdatedOn,
                state.IsDeleted));

        public Task<StateWithDistrictsResponse?> GetWithDistrictsByIdAsync(int id, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public Task<IReadOnlyList<StateLookupResponse>> GetLookupAsync(int? countryId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }

    private sealed class RecordingDistrictReadStore(District district) : IDistrictReadStore
    {
        public Task<PageResponse<DistrictListItemResponse>> GetPageAsync(GetDistrictsQuery query, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public Task<DistrictDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            Task.FromResult<DistrictDetailResponse?>(new(
                district.Id,
                district.NameAr,
                district.NameEn,
                district.Code,
                district.StateId,
                new SimpleStateResponse(district.StateId, "القاهرة", "Cairo", false),
                district.CreatedOn,
                district.UpdatedOn,
                district.IsDeleted));

        public Task<DistrictWithAddressesResponse?> GetWithAddressesByIdAsync(int id, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public Task<IReadOnlyList<DistrictLookupResponse>> GetLookupAsync(int? stateId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }

    private sealed class RecordingUnitOfWork : IUnitOfWork
    {
        public List<IReadOnlyCollection<string>> AtomicLockResources { get; } = [];
        public int SaveCount { get; private set; }

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
            SaveCount++;
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingStateScheduler : IStateChangeScheduler
    {
        public List<StateChange> Changes { get; } = [];
        public void Schedule(StateChange change) => Changes.Add(change);
    }

    private sealed class RecordingDistrictScheduler : IDistrictChangeScheduler
    {
        public List<DistrictChange> Changes { get; } = [];
        public void Schedule(DistrictChange change) => Changes.Add(change);
    }

    private sealed class RecordingStateAuditTrail : IStateAuditTrail
    {
        public void RecordUpdate(State existingState, State updatedState) { }
    }

    private sealed class RecordingDistrictAuditTrail : IDistrictAuditTrail
    {
        public void RecordUpdate(District existingDistrict, District updatedDistrict) { }
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
