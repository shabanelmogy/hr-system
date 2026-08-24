using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Services;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Jobs;

using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Services;

public class DistrictService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IEntityChangeLogService entityChangeLogService,
    DistrictErrors districtErrors,
    IMapper mapper) : IDistrictService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly DistrictErrors _districtErrors = districtErrors;

    public async Task<IEnumerable<DistrictResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var districts = await _context.Districts
                                     .AsNoTracking()
                                     .ProjectToType<DistrictResponse>()
                                     .ToListAsync(cancellationToken);

        return districts;
    }

    public async Task<IEnumerable<DistrictResponse>> GetAllByStateAsync(int stateId, CancellationToken cancellationToken = default)
    {
        var districts = await _context.Districts
                                     .AsNoTracking()
                                     .Where(d => d.StateId == stateId && !d.IsDeleted)
                                     .ProjectToType<DistrictResponse>()
                                     .ToListAsync(cancellationToken);

        return districts;
    }

    public async Task<Result<DistrictResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.Districts.FindAsync(id, cancellationToken);

        return response is not null
        ? Result.Success(response.Adapt<DistrictResponse>())
            : Result.Failure<DistrictResponse>(_districtErrors.DistrictNotFound);
    }

    public async Task<Result<DistrictResponse>> GetRelatedAddresses(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.Districts
                                        .Include(d => d.Addresses)
                                        .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        return response is null
             ? Result.Failure<DistrictResponse>(_districtErrors.DistrictNotFound)
             : Result.Success(response.Adapt<DistrictResponse>());
    }

    public async Task<Result<DistrictResponse>> AddAsync(DistrictRequest districtRequest, CancellationToken cancellationToken = default)
    {
        DistrictResponse? publishedResponse = null;
        var result = await _context.ExecuteAtomicallyAsync(
            [GeographicalLifecycleLocks.State(districtRequest.StateId)],
            async token =>
            {
                var isStateExists = await _context.States
                    .AnyAsync(state => state.Id == districtRequest.StateId && !state.IsDeleted, token);
                if (!isStateExists)
                    return Result.Failure<DistrictResponse>(_districtErrors.StateNotFound);

                var newDistrict = _mapper.Map<District>(districtRequest);
                await _context.AddAsync(newDistrict, token);
                await _context.SaveChangesAsync(token);

                var savedDistrict = await _context.Districts
                    .AsNoTracking()
                    .Include(district => district.State)
                    .FirstAsync(district => district.Id == newDistrict.Id, token);
                publishedResponse = _mapper.Map<DistrictResponse>(savedDistrict);
                return Result.Success(publishedResponse);
            },
            cancellationToken);

        if (publishedResponse is not null)
            QueueDistrictChanged(publishedResponse, "Add");

        return result;
    }

    public async Task<Result<DistrictResponse>> UpdateAsync(DistrictRequest districtRequest, CancellationToken cancellationToken = default)
    {
        DistrictResponse? publishedResponse = null;
        var result = await _context.ExecuteAtomicallyAsync(
            [GeographicalLifecycleLocks.State(districtRequest.StateId)],
            async token =>
            {
                var currentDistrict = await _context.Districts
                    .Include(district => district.State)
                    .FirstOrDefaultAsync(district => district.Id == districtRequest.Id, token);
                if (currentDistrict is null)
                    return Result.Failure<DistrictResponse>(_districtErrors.DistrictNotFound);

                var isStateExists = await _context.States
                    .AnyAsync(state => state.Id == districtRequest.StateId && !state.IsDeleted, token);
                if (!isStateExists)
                    return Result.Failure<DistrictResponse>(_districtErrors.StateNotFound);

                var updatedDistrict = districtRequest.Adapt<District>();
                await _entityChangeLogService.CreateChangeLogAsync(
                    districtRequest.Id,
                    currentDistrict,
                    updatedDistrict);

                _mapper.Map(districtRequest, currentDistrict);
                _context.Update(currentDistrict);
                await _context.SaveChangesAsync(token);

                var savedDistrict = await _context.Districts
                    .AsNoTracking()
                    .Include(district => district.State)
                    .FirstAsync(district => district.Id == currentDistrict.Id, token);
                publishedResponse = _mapper.Map<DistrictResponse>(savedDistrict);
                return Result.Success(publishedResponse);
            },
            cancellationToken);

        if (publishedResponse is not null)
            QueueDistrictChanged(publishedResponse, "Update");

        return result;
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        while (true)
        {
            var expectedStateId = await _context.Districts
                .AsNoTracking()
                .Where(district => district.Id == id)
                .Select(district => (int?)district.StateId)
                .FirstOrDefaultAsync(cancellationToken);
            if (!expectedStateId.HasValue)
                return Result.Failure(_districtErrors.DistrictNotFound);

            var retryWithCurrentParent = false;
            DistrictResponse? publishedResponse = null;
            string? publishedAction = null;
            var result = await _context.ExecuteAtomicallyAsync(
                [GeographicalLifecycleLocks.State(expectedStateId.Value)],
                async token =>
                {
                    var district = await _context.Districts
                        .Include(item => item.State)
                        .FirstOrDefaultAsync(item => item.Id == id, token);
                    if (district is null)
                        return Result.Failure(_districtErrors.DistrictNotFound);
                    if (district.StateId != expectedStateId.Value)
                    {
                        retryWithCurrentParent = true;
                        return Result.Success();
                    }

                    if (district.IsDeleted && district.State?.IsDeleted != false)
                        return Result.Failure(_districtErrors.StateNotFound);

                    var isInAddress = await _context.Addresses
                        .AnyAsync(address => address.DistrictId == id, token);
                    if (isInAddress)
                        return Result.Failure(_districtErrors.DistrictInUseByAddress);

                    district.IsDeleted = !district.IsDeleted;
                    if (district.IsDeleted)
                    {
                        district.DeletedById = _currentActor.UserId;
                        district.DeletedByPc = Environment.MachineName;
                        district.DeletedOn = DateTime.UtcNow;
                    }
                    else
                    {
                        district.DeletedById = null;
                        district.DeletedByPc = null;
                        district.DeletedOn = null;
                    }

                    await _context.SaveChangesAsync(token);
                    publishedAction = district.IsDeleted ? "Delete" : "Restore";
                    publishedResponse = _mapper.Map<DistrictResponse>(district);
                    return Result.Success();
                },
                cancellationToken);

            if (retryWithCurrentParent)
                continue;

            if (publishedResponse is not null && publishedAction is not null)
                QueueDistrictChanged(publishedResponse, publishedAction);

            return result;
        }
    }

    public async Task<Result<DistrictsCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.Districts
                                  .Where(d => !d.IsDeleted)
                                  .CountAsync(cancellationToken);

        var response = new DistrictsCountResponse(count);

        return Result.Success(response);
    }

    private void QueueDistrictChanged(DistrictResponse district, string action)
    {
        var request = new DistrictChangedJobRequest(
            district,
            action,
            _currentActor.UserId,
            Guid.NewGuid());

        BackgroundJob.Enqueue<DistrictChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }
}
