using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;

public interface IStateReadStore
{
    Task<PageResponse<StateListItemResponse>> GetPageAsync(GetStatesQuery query, CancellationToken cancellationToken);
    Task<StateDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<StateWithDistrictsResponse?> GetWithDistrictsByIdAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<StateLookupResponse>> GetLookupAsync(int? countryId, CancellationToken cancellationToken);
}

public interface IStateWriteStore
{
    void Add(State state);

    void AddRange(IReadOnlyCollection<State> states);

    Task<State?> GetForUpdateAsync(int id, CancellationToken cancellationToken);

    Task<IReadOnlyList<State>> GetForUpdateAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken);

    Task<bool> HasConflictAsync(State candidate, int? excludedId, CancellationToken cancellationToken);

    Task<bool> HasAnyConflictAsync(IReadOnlyCollection<State> states, CancellationToken cancellationToken);

    Task<bool> AreCountriesActiveAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken);

    Task<bool> IsCountryActiveAsync(int countryId, CancellationToken cancellationToken);

    Task<bool> HasActiveDistrictsAsync(int stateId, CancellationToken cancellationToken);

    Task<bool> HasActiveDistrictsAsync(IReadOnlyCollection<int> stateIds, CancellationToken cancellationToken);
}

public interface IStateChangeScheduler
{
    void Schedule(StateChange change);
}

public interface IStateAuditTrail
{
    void RecordUpdate(State existingState, State updatedState);
}
