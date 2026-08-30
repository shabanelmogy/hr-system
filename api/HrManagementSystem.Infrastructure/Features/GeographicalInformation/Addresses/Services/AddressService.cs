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
                                    .Include(a => a.Country)
                                    .Include(a => a.State)
                                    .Include(a => a.District)
                                    .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return response is null
             ? Result.Failure<AddressResponse>(_addressErrors.AddressNotFound)
             : Result.Success(response.Adapt<AddressResponse>());
    }

    public async Task<Result<AddressResponse>> AddAsync(AddressRequest addressRequest, CancellationToken cancellationToken = default)
    {
        addressRequest = Normalize(addressRequest);
        AddressResponse? publishedResponse = null;
        var result = await _context.ExecuteAtomicallyAsync(
            GetLockResources(addressRequest),
            async token =>
            {
                var hierarchyError = await ValidateHierarchyAsync(addressRequest, token);
                if (hierarchyError is not null)
                    return Result.Failure<AddressResponse>(hierarchyError);
                if (!await IsActiveOperatingCountryAsync(addressRequest.CountryId, token))
                    return Result.Failure<AddressResponse>(_addressErrors.CountryOutsideOperatingScope);
                if (!await IsActiveAddressTypeAsync(addressRequest.AddressTypeId, token))
                    return Result.Failure<AddressResponse>(_addressErrors.AddressTypeNotFound);

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
        addressRequest = Normalize(addressRequest);
        while (true)
        {
            var expectedSnapshot = await _context.Addresses
                .AsNoTracking()
                .Where(address => address.Id == addressRequest.Id)
                .Select(address => new AddressLifecycleSnapshot(
                    address.AddressTypeId,
                    address.CountryId,
                    address.StateId,
                    address.DistrictId,
                    address.IsDeleted))
                .FirstOrDefaultAsync(cancellationToken);
            if (expectedSnapshot is null)
                return Result.Failure<AddressResponse>(_addressErrors.AddressNotFound);

            var retryWithCurrentSnapshot = false;
            AddressResponse? publishedResponse = null;
            var lockResources = GetLockResources(expectedSnapshot)
                .Concat(GetLockResources(addressRequest))
                .ToArray();
            var result = await _context.ExecuteAtomicallyAsync(
                lockResources,
                async token =>
                {
                    var currentAddress = await _context.Addresses
                        .FirstOrDefaultAsync(address => address.Id == addressRequest.Id, token);
                    if (currentAddress is null)
                        return Result.Failure<AddressResponse>(_addressErrors.AddressNotFound);
                    if (!MatchesSnapshot(currentAddress, expectedSnapshot))
                    {
                        retryWithCurrentSnapshot = true;
                        return Result.Success(currentAddress.Adapt<AddressResponse>());
                    }

                    var hierarchyError = await ValidateHierarchyAsync(addressRequest, token);
                    if (hierarchyError is not null)
                        return Result.Failure<AddressResponse>(hierarchyError);
                    if (!await IsActiveOperatingCountryAsync(addressRequest.CountryId, token))
                        return Result.Failure<AddressResponse>(_addressErrors.CountryOutsideOperatingScope);
                    if (!await IsActiveAddressTypeAsync(addressRequest.AddressTypeId, token))
                        return Result.Failure<AddressResponse>(_addressErrors.AddressTypeNotFound);

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

            if (retryWithCurrentSnapshot)
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
            var expectedSnapshot = await _context.Addresses
                .AsNoTracking()
                .Where(address => address.Id == id)
                .Select(address => new AddressLifecycleSnapshot(
                    address.AddressTypeId,
                    address.CountryId,
                    address.StateId,
                    address.DistrictId,
                    address.IsDeleted))
                .FirstOrDefaultAsync(cancellationToken);
            if (expectedSnapshot is null)
                return Result.Failure(_addressErrors.AddressNotFound);

            var retryWithCurrentSnapshot = false;
            AddressResponse? publishedResponse = null;
            string? publishedAction = null;
            var result = await _context.ExecuteAtomicallyAsync(
                GetLockResources(expectedSnapshot),
                async token =>
                {
                    var address = await _context.Addresses
                        .FirstOrDefaultAsync(item => item.Id == id, token);
                    if (address is null)
                        return Result.Failure(_addressErrors.AddressNotFound);
                    if (!MatchesSnapshot(address, expectedSnapshot))
                    {
                        retryWithCurrentSnapshot = true;
                        return Result.Success();
                    }

                    if (address.IsDeleted)
                    {
                        var hierarchyError = await ValidateHierarchyAsync(
                            address.CountryId,
                            address.StateId,
                            address.DistrictId,
                            token);
                        if (hierarchyError is not null)
                            return Result.Failure(hierarchyError);
                        if (!await IsActiveOperatingCountryAsync(address.CountryId, token))
                            return Result.Failure(_addressErrors.CountryOutsideOperatingScope);
                        if (!await IsActiveAddressTypeAsync(address.AddressTypeId, token))
                            return Result.Failure(_addressErrors.AddressTypeNotFound);
                    }

                    if (!address.IsDeleted && await IsAddressLinkedToOwnerAsync(address.Id, token))
                        return Result.Failure(_addressErrors.AddressInUseByOtherEntities);

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

            if (retryWithCurrentSnapshot)
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

    private Task<bool> IsActiveAddressTypeAsync(int addressTypeId, CancellationToken cancellationToken) =>
        _context.AddressTypes.AnyAsync(
            addressType => addressType.Id == addressTypeId && !addressType.IsDeleted,
            cancellationToken);

    private string[] GetLockResources(AddressRequest request)
        => GetLockResources(
            request.AddressTypeId,
            request.CountryId,
            request.StateId,
            request.DistrictId);

    private string[] GetLockResources(AddressLifecycleSnapshot snapshot)
        => GetLockResources(
            snapshot.AddressTypeId,
            snapshot.CountryId,
            snapshot.StateId,
            snapshot.DistrictId);

    private string[] GetLockResources(
        int addressTypeId,
        int countryId,
        int? stateId,
        int? districtId)
    {
        var resources = new List<string>
        {
            GeographicalLifecycleLocks.Country(countryId),
            GeographicalLifecycleLocks.AddressType(addressTypeId),
            GetCompanyGeographicScopeLockResource()
        };

        if (stateId.HasValue)
            resources.Add(GeographicalLifecycleLocks.State(stateId.Value));
        if (districtId.HasValue)
            resources.Add(GeographicalLifecycleLocks.District(districtId.Value));

        return resources.ToArray();
    }

    private async Task<Error?> ValidateHierarchyAsync(
        AddressRequest request,
        CancellationToken cancellationToken)
        => await ValidateHierarchyAsync(
            request.CountryId,
            request.StateId,
            request.DistrictId,
            cancellationToken);

    private async Task<Error?> ValidateHierarchyAsync(
        int countryId,
        int? stateId,
        int? districtId,
        CancellationToken cancellationToken)
    {
        var countryIsActive = await _context.Countries
            .AnyAsync(country => country.Id == countryId && !country.IsDeleted, cancellationToken);
        if (!countryIsActive)
            return _addressErrors.InvalidCountry;

        if (stateId.HasValue)
        {
            var stateIsValid = await _context.States
                .AnyAsync(state => state.Id == stateId.Value &&
                                   state.CountryId == countryId &&
                                   !state.IsDeleted,
                    cancellationToken);
            if (!stateIsValid)
                return _addressErrors.InvalidState;
        }

        if (districtId.HasValue)
        {
            var districtIsValid = await _context.Districts
                .AnyAsync(district => district.Id == districtId.Value &&
                                      district.StateId == stateId &&
                                      !district.IsDeleted &&
                                      !district.State!.IsDeleted &&
                                      district.State.CountryId == countryId &&
                                      !district.State.Country!.IsDeleted,
                    cancellationToken);
            if (!districtIsValid)
                return _addressErrors.InvalidDistrict;
        }

        return null;
    }

    private async Task<bool> IsActiveOperatingCountryAsync(
        int countryId,
        CancellationToken cancellationToken)
    {
        if (!_currentActor.CompanyId.HasValue || string.IsNullOrWhiteSpace(_currentActor.TenantId))
            return false;

        return await _context.CompanyCountries
            .AnyAsync(
                companyCountry =>
                    companyCountry.TenantId == _currentActor.TenantId &&
                    companyCountry.CompanyId == _currentActor.CompanyId.Value &&
                    companyCountry.CountryId == countryId &&
                    !companyCountry.IsDeleted,
                cancellationToken);
    }

    private string GetCompanyGeographicScopeLockResource() =>
        $"company-geographic-scope:{_currentActor.TenantId}:{_currentActor.CompanyId}";

    private static bool MatchesSnapshot(Address address, AddressLifecycleSnapshot snapshot) =>
        address.AddressTypeId == snapshot.AddressTypeId &&
        address.CountryId == snapshot.CountryId &&
        address.StateId == snapshot.StateId &&
        address.DistrictId == snapshot.DistrictId &&
        address.IsDeleted == snapshot.IsDeleted;

    private async Task<bool> IsAddressLinkedToOwnerAsync(int addressId, CancellationToken cancellationToken) =>
        await _context.Set<CompanyAddress>()
            .AnyAsync(link => link.AddressId == addressId && !link.IsDeleted, cancellationToken) ||
        await _context.Set<BranchAddress>()
            .AnyAsync(link => link.AddressId == addressId && !link.IsDeleted, cancellationToken);

    private static AddressRequest Normalize(AddressRequest request) => request with
    {
        City = Normalize(request.City),
        StreetLine1 = Normalize(request.StreetLine1),
        StreetLine2 = Normalize(request.StreetLine2),
        BuildingNumber = Normalize(request.BuildingNumber),
        Floor = Normalize(request.Floor),
        ApartmentNumber = Normalize(request.ApartmentNumber),
        PostalCode = Normalize(request.PostalCode),
        AdditionalInfo = Normalize(request.AdditionalInfo)
    };

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record AddressLifecycleSnapshot(
        int AddressTypeId,
        int CountryId,
        int? StateId,
        int? DistrictId,
        bool IsDeleted);
}
