using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Errors;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Jobs;

using HrManagementSystem.Features.Platform.EntityChangeLogs.Services;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Services;

public class AddressService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    AddressErrors addressErrors,
    IMapper mapper) : IAddressService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly AddressErrors _addressErrors = addressErrors;

    public async Task<IEnumerable<AddressResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var addresses = await _context.Addresses
                                     .AsNoTracking()
                                     .ProjectToType<AddressResponse>()
                                     .ToListAsync(cancellationToken);

        return addresses;
    }

    public async Task<Result<AddressResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.Addresses.FindAsync(id, cancellationToken);

        return response is not null
        ? Result.Success(response.Adapt<AddressResponse>())
            : Result.Failure<AddressResponse>(_addressErrors.AddressNotFound);
    }

    public async Task<Result<AddressResponse>> GetWithRelatedEntities(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.Addresses
                                    .Include(a => a.AddressType)
                                    .Include(a => a.District)
                                    .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return response is null
             ? Result.Failure<AddressResponse>(_addressErrors.AddressNotFound)
             : Result.Success(response.Adapt<AddressResponse>());
    }

    public async Task<Result<AddressResponse>> AddAsync(AddressRequest addressRequest, CancellationToken cancellationToken = default)
    {
        // Handle default address logic
        if (addressRequest.IsDefault)
        {
            await UnsetOtherDefaultAddresses(cancellationToken);
        }

        var newAddress = _mapper.Map<Address>(addressRequest);

        await _context.AddAsync(newAddress, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = newAddress.Adapt<AddressResponse>();

        QueueAddressChanged(response, "Add");

        return Result.Success(response);
    }

    public async Task<Result<AddressResponse>> UpdateAsync(AddressRequest addressRequest, CancellationToken cancellationToken = default)
    {
        var currentAddress = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressRequest.Id, cancellationToken);

        if (currentAddress is null)
            return Result.Failure<AddressResponse>(_addressErrors.AddressNotFound);

        // Handle default address logic
        if (addressRequest.IsDefault && !currentAddress.IsDefault)
        {
            await UnsetOtherDefaultAddresses(cancellationToken);
        }

        var updatedAddress = addressRequest.Adapt<Address>();
        await _entityChangeLogService.CreateChangeLogAsync(addressRequest.Id, currentAddress, updatedAddress);

        _mapper.Map(addressRequest, currentAddress);
        _context.Update(currentAddress);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<AddressResponse>(currentAddress);
        QueueAddressChanged(response, "Update");

        return Result.Success(response);
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses.FindAsync(id);

        if (address is null)
            return Result.Failure(_addressErrors.AddressNotFound);

        // Prevent deletion of default address
        if (address.IsDefault)
            return Result.Failure(_addressErrors.DefaultAddressCannotBeDeleted);        

        address.IsDeleted = !address.IsDeleted;
        address.DeletedById = _httpContextAccessor.HttpContext!.User.GetUserId()!;
        address.DeletedByPc = Environment.MachineName;
        address.DeletedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var action = address.IsDeleted ? "Delete" : "Restore";
        QueueAddressChanged(_mapper.Map<AddressResponse>(address), action);

        return Result.Success();
    }

    public async Task<Result<AddressesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.Addresses
                          .Where(a => !a.IsDeleted)
                          .CountAsync(cancellationToken: cancellationToken);

        var response = new AddressesCountResponse(count);

        return Result.Success(response);
    }

    private void QueueAddressChanged(AddressResponse address, string action)
    {
        var request = new AddressChangedJobRequest(
            address,
            action,
            _httpContextAccessor.HttpContext?.User.GetUserId(),
            Guid.NewGuid());

        BackgroundJob.Enqueue<AddressChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }

    private async Task UnsetOtherDefaultAddresses(CancellationToken cancellationToken = default)
    {
        var defaultAddresses = await _context.Addresses
                                           .Where(a => a.IsDefault && !a.IsDeleted)
                                           .ToListAsync(cancellationToken);

        foreach (var address in defaultAddresses)
        {
            address.IsDefault = false;
        }

        if (defaultAddresses.Any())
        {
            _context.UpdateRange(defaultAddresses);
        }
    }
}
