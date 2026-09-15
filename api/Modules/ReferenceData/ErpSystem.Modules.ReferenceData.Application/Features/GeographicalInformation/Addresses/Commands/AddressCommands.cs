using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Errors;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Commands;

public sealed record CreateAddressCommand(AddressRequest Request) : ICommand<Result<AddressResponse>>;
public sealed record UpdateAddressCommand(AddressRequest Request) : ICommand<Result<AddressResponse>>;
public sealed record ToggleAddressCommand(int Id) : ICommand<Result>;

public sealed class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator(IValidator<AddressRequest> addressValidator) =>
        RuleFor(command => command.Request).SetValidator(addressValidator);
}

public sealed class UpdateAddressCommandValidator : AbstractValidator<UpdateAddressCommand>
{
    public UpdateAddressCommandValidator(IValidator<AddressRequest> addressValidator) =>
        RuleFor(command => command.Request).SetValidator(addressValidator);
}

public sealed class CreateAddressCommandHandler(
    IAddressWriteStore writeStore,
    IAddressReadStore readStore,
    IUnitOfWork unitOfWork,
    ICompanyGeographySource companyGeography,
    IAddressChangeScheduler changeScheduler,
    ICurrentActor actor,
    AddressErrors errors)
    : ICommandHandler<CreateAddressCommand, Result<AddressResponse>>
{
    public async Task<Result<AddressResponse>> Handle(CreateAddressCommand command, CancellationToken cancellationToken)
    {
        var request = AddressUseCase.Normalize(command.Request);
        if (!AddressUseCase.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<AddressResponse>(errors.CountryOutsideOperatingScope);

        AddressChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            AddressUseCase.GetLockResources(request, tenantId, companyId),
            async token =>
            {
                var validationError = await AddressUseCase.ValidateAsync(
                    request,
                    writeStore,
                    companyGeography,
                    tenantId,
                    companyId,
                    errors,
                    token);
                if (validationError is not null)
                    return Result.Failure<AddressResponse>(validationError);

                var address = AddressUseCase.CreateEntity(request);
                writeStore.Add(address);
                await unitOfWork.SaveChangesAsync(token);

                var response = await readStore.GetByIdAsync(address.Id, token)
                    ?? throw new InvalidOperationException("The newly created Address could not be read.");
                change = new AddressChange(response, "Add", actor.UserId, tenantId, companyId, Guid.NewGuid());
                return Result.Success(response);
            },
            cancellationToken);

        if (change is not null)
            changeScheduler.Schedule(change);

        return result;
    }
}

public sealed class UpdateAddressCommandHandler(
    IAddressWriteStore writeStore,
    IAddressReadStore readStore,
    IUnitOfWork unitOfWork,
    ICompanyGeographySource companyGeography,
    IAddressAuditTrail auditTrail,
    IAddressChangeScheduler changeScheduler,
    ICurrentActor actor,
    AddressErrors errors)
    : ICommandHandler<UpdateAddressCommand, Result<AddressResponse>>
{
    public async Task<Result<AddressResponse>> Handle(UpdateAddressCommand command, CancellationToken cancellationToken)
    {
        var request = AddressUseCase.Normalize(command.Request);
        if (!AddressUseCase.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<AddressResponse>(errors.AddressNotFound);

        while (true)
        {
            var expected = await writeStore.GetSnapshotAsync(request.Id, cancellationToken);
            if (expected is null || expected.IsDeleted)
                return Result.Failure<AddressResponse>(errors.AddressNotFound);

            var retry = false;
            AddressChange? change = null;
            var locks = AddressUseCase.GetLockResources(expected, tenantId, companyId)
                .Concat(AddressUseCase.GetLockResources(request, tenantId, companyId))
                .Distinct(StringComparer.Ordinal)
                .ToArray();
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                locks,
                async token =>
                {
                    var address = await writeStore.GetForUpdateAsync(request.Id, token);
                    if (address is null || address.IsDeleted)
                        return Result.Failure<AddressResponse>(errors.AddressNotFound);
                    if (!AddressUseCase.Matches(address, expected))
                    {
                        retry = true;
                        return Result.Success<AddressResponse>(null!);
                    }

                    var validationError = await AddressUseCase.ValidateAsync(
                        request,
                        writeStore,
                        companyGeography,
                        tenantId,
                        companyId,
                        errors,
                        token);
                    if (validationError is not null)
                        return Result.Failure<AddressResponse>(validationError);

                    var updated = AddressUseCase.CreateEntity(request);
                    await auditTrail.RecordUpdateAsync(address, updated, token);
                    AddressUseCase.Apply(request, address);
                    await unitOfWork.SaveChangesAsync(token);

                    var response = await readStore.GetByIdAsync(address.Id, token)
                        ?? throw new InvalidOperationException("The updated Address could not be read.");
                    change = new AddressChange(response, "Update", actor.UserId, tenantId, companyId, Guid.NewGuid());
                    return Result.Success(response);
                },
                cancellationToken);

            if (retry)
                continue;
            if (change is not null)
                changeScheduler.Schedule(change);
            return result;
        }
    }
}

public sealed class ToggleAddressCommandHandler(
    IAddressWriteStore writeStore,
    IUnitOfWork unitOfWork,
    ICompanyGeographySource companyGeography,
    IAddressChangeScheduler changeScheduler,
    ICurrentActor actor,
    TimeProvider timeProvider,
    AddressErrors errors)
    : ICommandHandler<ToggleAddressCommand, Result>
{
    public async Task<Result> Handle(ToggleAddressCommand command, CancellationToken cancellationToken)
    {
        if (!AddressUseCase.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.AddressNotFound);

        while (true)
        {
            var expected = await writeStore.GetSnapshotAsync(command.Id, cancellationToken);
            if (expected is null)
                return Result.Failure(errors.AddressNotFound);

            var retry = false;
            AddressChange? change = null;
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                AddressUseCase.GetLockResources(expected, tenantId, companyId),
                async token =>
                {
                    var address = await writeStore.GetForUpdateAsync(command.Id, token);
                    if (address is null)
                        return Result.Failure(errors.AddressNotFound);
                    if (!AddressUseCase.Matches(address, expected))
                    {
                        retry = true;
                        return Result.Success();
                    }

                    if (address.IsDeleted)
                    {
                        var validationError = await AddressUseCase.ValidateAsync(
                            address,
                            writeStore,
                            companyGeography,
                            tenantId,
                            companyId,
                            errors,
                            token);
                        if (validationError is not null)
                            return Result.Failure(validationError);
                    }
                    else if (await writeStore.IsLinkedToOwnerAsync(address.Id, token))
                    {
                        return Result.Failure(errors.AddressInUseByOtherEntities);
                    }

                    address.IsDeleted = !address.IsDeleted;
                    if (address.IsDeleted)
                    {
                        address.DeletedById = actor.UserId;
                        address.DeletedByPc = actor.MachineName;
                        address.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
                    }
                    else
                    {
                        address.DeletedById = null;
                        address.DeletedByPc = null;
                        address.DeletedOn = null;
                    }

                    await unitOfWork.SaveChangesAsync(token);
                    change = new AddressChange(
                        AddressUseCase.ToResponse(address),
                        address.IsDeleted ? "Delete" : "Restore",
                        actor.UserId,
                        tenantId,
                        companyId,
                        Guid.NewGuid());
                    return Result.Success();
                },
                cancellationToken);

            if (retry)
                continue;
            if (change is not null)
                changeScheduler.Schedule(change);
            return result;
        }
    }
}

internal static class AddressUseCase
{
    public static AddressRequest Normalize(AddressRequest request) => request with
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

    public static Address CreateEntity(AddressRequest request) => new()
    {
        Id = request.Id,
        CountryId = request.CountryId,
        StateId = request.StateId,
        DistrictId = request.DistrictId,
        City = request.City,
        StreetLine1 = request.StreetLine1,
        StreetLine2 = request.StreetLine2,
        BuildingNumber = request.BuildingNumber,
        Floor = request.Floor,
        ApartmentNumber = request.ApartmentNumber,
        PostalCode = request.PostalCode,
        AdditionalInfo = request.AdditionalInfo,
        Latitude = request.Latitude,
        Longitude = request.Longitude,
        AddressTypeId = request.AddressTypeId
    };

    public static void Apply(AddressRequest request, Address address)
    {
        address.CountryId = request.CountryId;
        address.StateId = request.StateId;
        address.DistrictId = request.DistrictId;
        address.City = request.City;
        address.StreetLine1 = request.StreetLine1;
        address.StreetLine2 = request.StreetLine2;
        address.BuildingNumber = request.BuildingNumber;
        address.Floor = request.Floor;
        address.ApartmentNumber = request.ApartmentNumber;
        address.PostalCode = request.PostalCode;
        address.AdditionalInfo = request.AdditionalInfo;
        address.Latitude = request.Latitude;
        address.Longitude = request.Longitude;
        address.AddressTypeId = request.AddressTypeId;
    }

    public static bool TryGetScope(ICurrentActor actor, out string tenantId, out int companyId)
    {
        tenantId = actor.TenantId ?? string.Empty;
        companyId = actor.CompanyId ?? 0;
        return !string.IsNullOrWhiteSpace(tenantId) && companyId > 0;
    }

    public static string[] GetLockResources(AddressRequest request, string tenantId, int companyId) =>
        GetLockResources(request.AddressTypeId, request.CountryId, request.StateId, request.DistrictId, tenantId, companyId);

    public static string[] GetLockResources(AddressLifecycleSnapshot snapshot, string tenantId, int companyId) =>
        GetLockResources(snapshot.AddressTypeId, snapshot.CountryId, snapshot.StateId, snapshot.DistrictId, tenantId, companyId);

    public static bool Matches(Address address, AddressLifecycleSnapshot snapshot) =>
        address.AddressTypeId == snapshot.AddressTypeId &&
        address.CountryId == snapshot.CountryId &&
        address.StateId == snapshot.StateId &&
        address.DistrictId == snapshot.DistrictId &&
        address.IsDeleted == snapshot.IsDeleted;

    public static async Task<Error?> ValidateAsync(
        AddressRequest request,
        IAddressWriteStore writeStore,
        ICompanyGeographySource companyGeography,
        string tenantId,
        int companyId,
        AddressErrors errors,
        CancellationToken cancellationToken) =>
        await ValidateAsync(
            request.CountryId,
            request.StateId,
            request.DistrictId,
            request.AddressTypeId,
            writeStore,
            companyGeography,
            tenantId,
            companyId,
            errors,
            cancellationToken);

    public static async Task<Error?> ValidateAsync(
        Address address,
        IAddressWriteStore writeStore,
        ICompanyGeographySource companyGeography,
        string tenantId,
        int companyId,
        AddressErrors errors,
        CancellationToken cancellationToken) =>
        await ValidateAsync(
            address.CountryId,
            address.StateId,
            address.DistrictId,
            address.AddressTypeId,
            writeStore,
            companyGeography,
            tenantId,
            companyId,
            errors,
            cancellationToken);

    public static AddressResponse ToResponse(Address address) => new(
        address.Id,
        address.CountryId,
        address.StateId,
        address.DistrictId,
        address.City,
        address.StreetLine1,
        address.StreetLine2,
        address.BuildingNumber,
        address.Floor,
        address.ApartmentNumber,
        address.PostalCode,
        address.AdditionalInfo,
        address.Latitude,
        address.Longitude,
        address.AddressTypeId,
        address.CreatedOn,
        address.UpdatedOn,
        address.IsDeleted);

    private static async Task<Error?> ValidateAsync(
        int countryId,
        int? stateId,
        int? districtId,
        int addressTypeId,
        IAddressWriteStore writeStore,
        ICompanyGeographySource companyGeography,
        string tenantId,
        int companyId,
        AddressErrors errors,
        CancellationToken cancellationToken)
    {
        if (!await writeStore.IsCountryActiveAsync(countryId, cancellationToken))
            return errors.InvalidCountry;
        if (stateId.HasValue &&
            !await writeStore.IsStateActiveInCountryAsync(stateId.Value, countryId, cancellationToken))
            return errors.InvalidState;
        if (districtId.HasValue &&
            !await writeStore.IsDistrictActiveInHierarchyAsync(districtId.Value, stateId, countryId, cancellationToken))
            return errors.InvalidDistrict;
        if (!await companyGeography.IsCountryInScopeAsync(tenantId, companyId, countryId, cancellationToken))
            return errors.CountryOutsideOperatingScope;
        if (!await writeStore.IsAddressTypeActiveAsync(addressTypeId, cancellationToken))
            return errors.AddressTypeNotFound;
        return null;
    }

    private static string[] GetLockResources(
        int addressTypeId,
        int countryId,
        int? stateId,
        int? districtId,
        string tenantId,
        int companyId)
    {
        var resources = new List<string>
        {
            GeographicalLifecycleLocks.Country(countryId),
            GeographicalLifecycleLocks.AddressType(addressTypeId),
            $"company-geographic-scope:{tenantId}:{companyId}"
        };
        if (stateId.HasValue)
            resources.Add(GeographicalLifecycleLocks.State(stateId.Value));
        if (districtId.HasValue)
            resources.Add(GeographicalLifecycleLocks.District(districtId.Value));
        return resources.ToArray();
    }

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
