using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Services;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Errors;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;

using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Services;

public class AddressTypeService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IEntityChangeLogService entityChangeLogService,
    AddressTypeErrors addressTypeErrors,
    IMapper mapper) : IAddressTypeService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly AddressTypeErrors _addressTypeErrors = addressTypeErrors;

    public async Task<IEnumerable<AddressTypeResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var addressTypes = await _context.AddressTypes
                                        .AsNoTracking()
                                        .ProjectToType<AddressTypeResponse>()
                                        .ToListAsync(cancellationToken);

        return addressTypes;
    }

    public async Task<Result<AddressTypeResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.AddressTypes.FindAsync(id, cancellationToken);

        return response is not null
        ? Result.Success(response.Adapt<AddressTypeResponse>())
            : Result.Failure<AddressTypeResponse>(_addressTypeErrors.AddressTypeNotFound);
    }

    public async Task<Result<AddressTypeResponse>> GetRelatedAddresses(int id, CancellationToken cancellationToken = default)
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
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            throw new InvalidOperationException("A tenant and company are required to create an Address Type.");
        newAddressType.TenantId = _currentActor.TenantId;
        newAddressType.CompanyId = _currentActor.CompanyId.Value;

        await _context.AddAsync(newAddressType, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = newAddressType.Adapt<AddressTypeResponse>();

        QueueAddressTypeChanged(response, "Add");

        return Result.Success(response);
    }

    public async Task<Result<AddressTypeResponse>> UpdateAsync(AddressTypeRequest addressTypeRequest, CancellationToken cancellationToken = default)
    {
        var currentAddressType = await _context.AddressTypes.FirstOrDefaultAsync(a => a.Id == addressTypeRequest.Id, cancellationToken);

        if (currentAddressType is null)
            return Result.Failure<AddressTypeResponse>(_addressTypeErrors.AddressTypeNotFound);

        var updatedAddressType = addressTypeRequest.Adapt<AddressType>();
        await _entityChangeLogService.CreateChangeLogAsync(addressTypeRequest.Id, currentAddressType, updatedAddressType);

        _mapper.Map(addressTypeRequest, currentAddressType);
        _context.Update(currentAddressType);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<AddressTypeResponse>(currentAddressType);
        QueueAddressTypeChanged(response, "Update");

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
        addressType.DeletedById = _currentActor.UserId;
        addressType.DeletedByPc = Environment.MachineName;
        addressType.DeletedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var action = addressType.IsDeleted ? "Delete" : "Restore";
        QueueAddressTypeChanged(_mapper.Map<AddressTypeResponse>(addressType), action);

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

    private void QueueAddressTypeChanged(AddressTypeResponse addressType, string action)
    {
        var tenantId = _currentActor.TenantId;
        var companyId = _currentActor.CompanyId;
        if (string.IsNullOrWhiteSpace(tenantId) || !companyId.HasValue)
            throw new InvalidOperationException("A tenant and company are required for Address Type notifications.");

        var request = new AddressTypeChangedJobRequest(
            addressType,
            action,
            _currentActor.UserId,
            tenantId,
            companyId.Value,
            Guid.NewGuid());

        BackgroundJob.Enqueue<AddressTypeChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }
}
