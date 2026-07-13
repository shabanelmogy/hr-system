using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

namespace HrManagementSystem.Features.GeographicalInformation.States.Services;

public class StateService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    StateErrors stateErrors,
    IHubContext<GeneralHub, IGeneralHubClient> generalHubContext,
    IMapper mapper) : IStateService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly StateErrors _stateErrors = stateErrors;
    private readonly IHubContext<GeneralHub, IGeneralHubClient> _generalHubContext = generalHubContext;

    public async Task<IEnumerable<StateResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var states = await _context.States
            .AsNoTracking()
            .Include(state => state.Country)
            .Where(state => !state.IsDeleted)
            .OrderBy(state => state.NameEn)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<StateResponse>>(states);
    }

    public async Task<IEnumerable<StateResponse>> GetAllByCountryAsync(int countryId, CancellationToken cancellationToken = default)
    {
        var states = await _context.States
            .AsNoTracking()
            .Include(state => state.Country)
            .Where(state => state.CountryId == countryId && !state.IsDeleted)
            .OrderBy(state => state.NameEn)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<StateResponse>>(states);
    }

    public async Task<Result<StateResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.States
            .AsNoTracking()
            .FirstOrDefaultAsync(state => state.Id == id && !state.IsDeleted, cancellationToken);

        return response is not null
            ? Result.Success(_mapper.Map<StateResponse>(response))
            : Result.Failure<StateResponse>(_stateErrors.StateNotFound);
    }

    public async Task<Result<StateResponse>> GetRelatedDistricts(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.States
            .AsNoTracking()
            .Include(state => state.Districts.Where(district => !district.IsDeleted))
            .FirstOrDefaultAsync(state => state.Id == id && !state.IsDeleted, cancellationToken);

        return response is null
            ? Result.Failure<StateResponse>(_stateErrors.StateNotFound)
            : Result.Success(_mapper.Map<StateResponse>(response));
    }

    public async Task<Result<StateResponse>> AddAsync(StateRequest stateRequest, CancellationToken cancellationToken = default)
    {
        if (stateRequest.Id.GetValueOrDefault() != 0)
            return Result.Failure<StateResponse>(_stateErrors.InvalidStateId);

        stateRequest = Normalize(stateRequest);
        var newState = _mapper.Map<State>(stateRequest);
        newState.Id = 0;

        await _context.AddAsync(newState, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var savedState = await _context.States
            .AsNoTracking()
            .Include(state => state.Country)
            .FirstOrDefaultAsync(state => state.Id == newState.Id, cancellationToken);

        var response = _mapper.Map<StateResponse>(savedState!);

        await PublishStateUpdateAsync(response, "Add", cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result<StateResponse>> UpdateAsync(StateRequest stateRequest, CancellationToken cancellationToken = default)
    {
        if (!stateRequest.Id.HasValue || stateRequest.Id.Value <= 0)
            return Result.Failure<StateResponse>(_stateErrors.InvalidStateId);

        var stateId = stateRequest.Id.Value;
        stateRequest = Normalize(stateRequest);
        var currentState = await _context.States
            .FirstOrDefaultAsync(state => state.Id == stateId && !state.IsDeleted, cancellationToken);

        if (currentState is null)
            return Result.Failure<StateResponse>(_stateErrors.StateNotFound);

        var updatedState = _mapper.Map<State>(stateRequest);
        await _entityChangeLogService.CreateChangeLogAsync(stateId, currentState, updatedState);

        _mapper.Map(stateRequest, currentState);
        _context.Update(currentState);
        await _context.SaveChangesAsync(cancellationToken);

        var savedState = await _context.States
            .AsNoTracking()
            .Include(state => state.Country)
            .FirstOrDefaultAsync(state => state.Id == stateId, cancellationToken);

        var response = _mapper.Map<StateResponse>(savedState!);

        await PublishStateUpdateAsync(response, "Update", cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result> ToggleDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var state = await _context.States.FirstOrDefaultAsync(state => state.Id == id, cancellationToken);

        if (state is null)
            return Result.Failure(_stateErrors.StateNotFound);

        var isInDistrict = !state.IsDeleted &&
            await _context.Districts.AnyAsync(district => district.StateId == id && !district.IsDeleted, cancellationToken);

        if (isInDistrict)
            return Result.Failure(_stateErrors.StateInUseByDistrict);

        state.IsDeleted = !state.IsDeleted;
        state.DeletedById = state.IsDeleted ? _httpContextAccessor.HttpContext?.User.GetUserId() : null;
        state.DeletedByPc = state.IsDeleted ? Environment.MachineName : null;
        state.DeletedOn = state.IsDeleted ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync(cancellationToken);
        
        var action = state.IsDeleted ? "Delete" : "Restore";
        await PublishStateUpdateAsync(null, action, cancellationToken);

        return Result.Success();
    }

    public async Task<Result<StatesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.States
            .Where(state => !state.IsDeleted)
            .CountAsync(cancellationToken);

        var response = new StatesCountResponse(count, null, null);

        return Result.Success(response);
    }

    private static StateRequest Normalize(StateRequest request)
    {
        return request with
        {
            NameAr = request.NameAr?.Trim() ?? string.Empty,
            NameEn = request.NameEn?.Trim() ?? string.Empty,
            Code = request.Code?.Trim().ToUpperInvariant() ?? string.Empty
        };
    }

    private async Task PublishStateUpdateAsync(StateResponse? response, string action, CancellationToken cancellationToken)
    {
        var statesCountResult = await GetCountAsync(cancellationToken);
        if (statesCountResult.IsSuccess)
        {
            var statesCount = new StatesCountResponse(statesCountResult.Value.Count, response, action);
            await _generalHubContext.Clients.All.ReceiveStateUpdate(statesCount);
        }
    }
}
