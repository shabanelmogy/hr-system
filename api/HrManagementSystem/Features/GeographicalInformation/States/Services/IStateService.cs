using HrManagementSystem.Features.GeographicalInformation.States.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.States.Services;

public interface IStateService
{
    Task<IEnumerable<StateResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<StateResponse>> GetAllByCountryAsync(int countryId, CancellationToken cancellationToken);
    Task<Result<StateResponse>> GetAsync(int id, CancellationToken cancellationToken);
    Task<Result<StateResponse>> GetRelatedDistricts(int id, CancellationToken cancellationToken);
    Task<Result<StateResponse>> AddAsync(StateRequest state, CancellationToken cancellationToken);
    Task<Result<StateResponse>> UpdateAsync(StateRequest stateRequest, CancellationToken cancellationToken = default);
    Task<Result> ToggleDeleteAsync(int id, CancellationToken cancellationToken);
    Task<Result<StatesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default);
}
