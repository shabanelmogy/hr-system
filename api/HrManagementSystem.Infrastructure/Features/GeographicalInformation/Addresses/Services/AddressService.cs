using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Services;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Errors;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;

using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services;
using HrManagementSystem.Application.Abstractions.Authentication;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Services;

public class AddressService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IEntityChangeLogService entityChangeLogService,
    AddressErrors addressErrors,
    IMapper mapper) : IAddressService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly IMapper _mapper = mapper;
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
        AddressResponse? publishedResponse = null;
        var result = await _context.ExecuteAtomicallyAsync(
            [GeographicalLifecycleLocks.AddressType(addressRequest.AddressTypeId)],
            async token =>
            {
                if (!await IsActiveAddressTypeAsync(addressRequest.AddressTypeId, token))
                    return Result.Failure<AddressResponse>(_addressErrors.AddressTypeNotFound);

                if (addressRequest.IsDefault)
                    await UnsetOtherDefaultAddresses(token);

                var newAddress = _mapper.Map<Address>(addressRequest);
                await _context.AddAsync(newAddress, token);
                await _context.SaveChangesAsync(token);

                publishedResponse = newAddress.Adapt<AddressResponse>();
                return Result.Success(publishedResponse);
            },
            cancellationToken);

        if (publishedResponse is not null)
            QueueAddressChanged(publishedResponse, "Add");

        return result;
    }

    public async Task<Result<AddressResponse>> UpdateAsync(AddressRequest addressRequest, CancellationToken cancellationToken = default)
    {
        while (true)
        {
            var expectedAddressTypeId = await _context.Addresses
                .AsNoTracking()
                .Where(address => address.Id == addressRequest.Id)
                .Select(address => (int?)address.AddressTypeId)
                .FirstOrDefaultAsync(cancellationToken);
            if (!expectedAddressTypeId.HasValue)
                return Result.Failure<AddressResponse>(_addressErrors.AddressNotFound);

            var retryWithCurrentAddressType = false;
            AddressResponse? publishedResponse = null;
            var lockResources = new[] { expectedAddressTypeId.Value, addressRequest.AddressTypeId }
                .Distinct()
                .OrderBy(id => id)
                .Select(GeographicalLifecycleLocks.AddressType)
                .ToArray();
            var result = await _context.ExecuteAtomicallyAsync(
                lockResources,
                async token =>
                {
                    var currentAddress = await _context.Addresses
                        .FirstOrDefaultAsync(address => address.Id == addressRequest.Id, token);
                    if (currentAddress is null)
                        return Result.Failure<AddressResponse>(_addressErrors.AddressNotFound);
                    if (currentAddress.AddressTypeId != expectedAddressTypeId.Value)
                    {
                        retryWithCurrentAddressType = true;
                        return Result.Success(currentAddress.Adapt<AddressResponse>());
                    }

                    if (!await IsActiveAddressTypeAsync(addressRequest.AddressTypeId, token))
                        return Result.Failure<AddressResponse>(_addressErrors.AddressTypeNotFound);

                    if (addressRequest.IsDefault && !currentAddress.IsDefault)
                        await UnsetOtherDefaultAddresses(token);

                    var updatedAddress = addressRequest.Adapt<Address>();
                    await _entityChangeLogService.CreateChangeLogAsync(
                        addressRequest.Id,
                        currentAddress,
                        updatedAddress);

                    _mapper.Map(addressRequest, currentAddress);
                    _context.Update(currentAddress);
                    await _context.SaveChangesAsync(token);

                    publishedResponse = _mapper.Map<AddressResponse>(currentAddress);
                    return Result.Success(publishedResponse);
                },
                cancellationToken);

            if (retryWithCurrentAddressType)
                continue;

            if (publishedResponse is not null)
                QueueAddressChanged(publishedResponse, "Update");

            return result;
        }
    }

    public async Task<Result> ToggleAsync(int id, CancellationToken cancellationToken = default)
    {
        while (true)
        {
            var expectedAddressTypeId = await _context.Addresses
                .AsNoTracking()
                .Where(address => address.Id == id)
                .Select(address => (int?)address.AddressTypeId)
                .FirstOrDefaultAsync(cancellationToken);
            if (!expectedAddressTypeId.HasValue)
                return Result.Failure(_addressErrors.AddressNotFound);

            var retryWithCurrentAddressType = false;
            AddressResponse? publishedResponse = null;
            string? publishedAction = null;
            var result = await _context.ExecuteAtomicallyAsync(
                [GeographicalLifecycleLocks.AddressType(expectedAddressTypeId.Value)],
                async token =>
                {
                    var address = await _context.Addresses
                        .FirstOrDefaultAsync(item => item.Id == id, token);
                    if (address is null)
                        return Result.Failure(_addressErrors.AddressNotFound);
                    if (address.AddressTypeId != expectedAddressTypeId.Value)
                    {
                        retryWithCurrentAddressType = true;
                        return Result.Success();
                    }

                    if (address.IsDefault)
                        return Result.Failure(_addressErrors.DefaultAddressCannotBeDeleted);

                    if (address.IsDeleted && !await IsActiveAddressTypeAsync(address.AddressTypeId, token))
                        return Result.Failure(_addressErrors.AddressTypeNotFound);

                    address.IsDeleted = !address.IsDeleted;
                    if (address.IsDeleted)
                    {
                        address.DeletedById = _currentActor.UserId;
                        address.DeletedByPc = Environment.MachineName;
                        address.DeletedOn = DateTime.UtcNow;
                    }
                    else
                    {
                        address.DeletedById = null;
                        address.DeletedByPc = null;
                        address.DeletedOn = null;
                    }

                    await _context.SaveChangesAsync(token);
                    publishedAction = address.IsDeleted ? "Delete" : "Restore";
                    publishedResponse = _mapper.Map<AddressResponse>(address);
                    return Result.Success();
                },
                cancellationToken);

            if (retryWithCurrentAddressType)
                continue;

            if (publishedResponse is not null && publishedAction is not null)
                QueueAddressChanged(publishedResponse, publishedAction);

            return result;
        }
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
            _currentActor.UserId,
            _currentActor.TenantId ?? throw new InvalidOperationException(
                "A tenant is required to publish address changes."),
            _currentActor.CompanyId ?? throw new InvalidOperationException(
                "A company is required to publish address changes."),
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

    private Task<bool> IsActiveAddressTypeAsync(int addressTypeId, CancellationToken cancellationToken) =>
        _context.AddressTypes.AnyAsync(
            addressType => addressType.Id == addressTypeId && !addressType.IsDeleted,
            cancellationToken);
}
