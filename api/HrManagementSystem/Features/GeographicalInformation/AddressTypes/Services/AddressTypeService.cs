using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Errors;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;

namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Services;

public class AddressTypeService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    AddressTypeErrors addressTypeErrors,
    IHubContext<GeneralHub, IGeneralHubClient> generalHubContext,
    IMapper mapper) : IAddressTypeService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly AddressTypeErrors _addressTypeErrors = addressTypeErrors;
    private readonly IHubContext<GeneralHub, IGeneralHubClient> _generalHubContext = generalHubContext;

    public async Task<IEnumerable<AddressTypeResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var addressTypes = await _context.AddressTypes
                                        .AsNoTracking()
                                        .ProjectToType<AddressTypeResponse>()
                                        .ToListAsync(cancellationToken);

        return addressTypes;
    }

    public async Task<Result<AddressTypeResponse>>? GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.AddressTypes.FindAsync(id, cancellationToken);

        return response is not null
        ? Result.Success(response.Adapt<AddressTypeResponse>())
            : Result.Failure<AddressTypeResponse>(_addressTypeErrors.AddressTypeNotFound);
    }

    public async Task<Result<AddressTypeResponse>>? GetRelatedAddresses(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.AddressTypes
                                    .Include(a => a.Addresses)
                                    .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return response is null
             ? Result.Failure<AddressTypeResponse>(_addressTypeErrors.AddressTypeNotFound)
             : Result.Success(response.Adapt<AddressTypeResponse>());
    }

    public async Task<Result<AddressTypeResponse>> AddAsync(AddressTypeRequest addressTypeRequest, CancellationToken cancellationToken = default)
    {
        var newAddressType = _mapper.Map<AddressType>(addressTypeRequest);

        await _context.AddAsync(newAddressType, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = newAddressType.Adapt<AddressTypeResponse>();

        var addressTypesCount = await GetCountAsync(cancellationToken);

        await _generalHubContext.Clients.All.ReceiveAddressTypeUpdate(addressTypesCount);

        return Result.Success(response);
    }

    public async Task<Result<AddressTypeResponse>> UpdateAsync(AddressTypeRequest addressTypeRequest, CancellationToken cancellationToken = default)
    {
        var currentAddressType = await _context.AddressTypes.FirstOrDefaultAsync(a => a.Id == addressTypeRequest.Id, cancellationToken);

        if (currentAddressType is null)
            return Result.Failure<AddressTypeResponse>(_addressTypeErrors.AddressTypeNotFound);

        var updatedAddressType = addressTypeRequest.Adapt<AddressType>();
        await _entityChangeLogService.CreateChangeLogAsync(addressTypeRequest.Id, currentAddressType, updatedAddressType);

        mapper.Map(addressTypeRequest, currentAddressType);
        _context.Update(currentAddressType);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<AddressTypeResponse>(currentAddressType);

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var addressType = await _context.AddressTypes.FindAsync(id);

        // Check if AddressType is used by any Address before allowing deletion
        var isInAddress = await _context.Addresses.AnyAsync(a => a.AddressTypeId == id, cancellationToken);
        if (isInAddress)
            return Result.Failure(_addressTypeErrors.AddressTypeInUseByAddress);

        if (addressType is null)
            return Result.Failure(_addressTypeErrors.AddressTypeNotFound);

        addressType.IsDeleted = !addressType.IsDeleted;
        addressType.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId()!;
        addressType.DeletedByPc = Environment.MachineName;
        addressType.DeletedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<AddressTypesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.AddressTypes
                          .Where(a => !a.IsDeleted)
                          .CountAsync(cancellationToken: cancellationToken);

        var response = new AddressTypesCountResponse(count);

        return Result.Success(response);
    }
}