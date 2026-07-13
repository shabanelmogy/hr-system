using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Services;

public class DistrictService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    DistrictErrors districtErrors,
    IHubContext<GeneralHub, IGeneralHubClient> generalHubContext,
    IMapper mapper) : IDistrictService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly DistrictErrors _districtErrors = districtErrors;
    private readonly IHubContext<GeneralHub, IGeneralHubClient> _generalHubContext = generalHubContext;

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
        var isStateExists = await _context.States
                                      .AnyAsync(s => s.Id == districtRequest.StateId && !s.IsDeleted, cancellationToken);
        if (!isStateExists)
            return Result.Failure<DistrictResponse>(_districtErrors.StateNotFound);

        var newDistrict = _mapper.Map<District>(districtRequest);

        await _context.AddAsync(newDistrict, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = newDistrict.Adapt<DistrictResponse>();

        var districtsCount = await GetCountAsync(cancellationToken);

        await _generalHubContext.Clients.All.ReceiveDistrictUpdate(districtsCount);

        return Result.Success(response);
    }

    public async Task<Result<DistrictResponse>> UpdateAsync(DistrictRequest districtRequest, CancellationToken cancellationToken = default)
    {
        var currentDistrict = await _context.Districts.FirstOrDefaultAsync(d => d.Id == districtRequest.Id, cancellationToken);
        if (currentDistrict is null)
            return Result.Failure<DistrictResponse>(_districtErrors.DistrictNotFound);

        var isStateExists = await _context.States
                                  .AnyAsync(s => s.Id == districtRequest.StateId && !s.IsDeleted, cancellationToken);
        if (!isStateExists)
            return Result.Failure<DistrictResponse>(_districtErrors.StateNotFound);

        var updatedDistrict = districtRequest.Adapt<District>();
        await _entityChangeLogService.CreateChangeLogAsync(districtRequest.Id, currentDistrict, updatedDistrict);

        _mapper.Map(districtRequest, currentDistrict);
        _context.Update(currentDistrict);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<DistrictResponse>(currentDistrict);

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var district = await _context.Districts.FindAsync(id);
        if (district is null)
            return Result.Failure(_districtErrors.DistrictNotFound);

        var isInAddress = await _context.Addresses.AnyAsync(a => a.DistrictId == id, cancellationToken);
        if (isInAddress)
            return Result.Failure(_districtErrors.DistrictInUseByAddress);

        district.IsDeleted = !district.IsDeleted;
        district.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId()!;
        district.DeletedByPc = Environment.MachineName;
        district.DeletedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<DistrictsCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.Districts
                                  .Where(d => !d.IsDeleted)
                                  .CountAsync(cancellationToken);

        var response = new DistrictsCountResponse(count);

        return Result.Success(response);
    }
}

