using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using MapsterMapper;

namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Commands;

public sealed record CreateAddressTypeCommand(string NameAr, string NameEn) : AddressTypeMutation(NameAr, NameEn), ICommand<Result<AddressTypeDetailResponse>>;
public sealed record UpdateAddressTypeCommand(int Id, string NameAr, string NameEn) : AddressTypeMutation(NameAr, NameEn), ICommand<Result<AddressTypeDetailResponse>>;
public sealed record ArchiveAddressTypeCommand(int Id) : ICommand<Result>;
public sealed record RestoreAddressTypeCommand(int Id) : ICommand<Result>;
public sealed record BulkArchiveAddressTypesCommand(IReadOnlyList<int> Ids) : ICommand<Result<BulkArchiveAddressTypesResponse>>;
public sealed record CreateAddressTypesCommand(IReadOnlyList<CreateAddressTypeRequest> AddressTypes) : ICommand<Result<CreateAddressTypesResponse>>;

internal static class AddressTypeCompanyScope
{
    public static void Apply(AddressType addressType, ICurrentActor actor)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            throw new InvalidOperationException("A tenant and company are required to create an Address Type.");

        addressType.TenantId = actor.TenantId;
        addressType.CompanyId = actor.CompanyId.Value;
    }
}

public class AddressTypeMutationValidator<TMutation> : AbstractValidator<TMutation> where TMutation : AddressTypeMutation
{
    public AddressTypeMutationValidator(IStringLocalizer<AddressTypeRequest> localizer)
    {
        RuleFor(item => item.NameEn).GeographicalName(localizer, Strings.NameEn);
        RuleFor(item => item.NameAr).GeographicalName(localizer, Strings.NameAr);
    }
}
public sealed class CreateAddressTypeCommandValidator : AddressTypeMutationValidator<CreateAddressTypeCommand> { public CreateAddressTypeCommandValidator(IStringLocalizer<AddressTypeRequest> localizer) : base(localizer) { } }
public sealed class UpdateAddressTypeCommandValidator : AddressTypeMutationValidator<UpdateAddressTypeCommand> { public UpdateAddressTypeCommandValidator(IStringLocalizer<AddressTypeRequest> localizer) : base(localizer) { RuleFor(command => command.Id).GreaterThan(0); } }
public sealed class ArchiveAddressTypeCommandValidator : AbstractValidator<ArchiveAddressTypeCommand> { public ArchiveAddressTypeCommandValidator() => RuleFor(command => command.Id).GreaterThan(0); }
public sealed class RestoreAddressTypeCommandValidator : AbstractValidator<RestoreAddressTypeCommand> { public RestoreAddressTypeCommandValidator() => RuleFor(command => command.Id).GreaterThan(0); }
public sealed class BulkArchiveAddressTypesCommandValidator : AbstractValidator<BulkArchiveAddressTypesCommand>
{
    public const int MaximumBatchSize = 100;
    public BulkArchiveAddressTypesCommandValidator(IStringLocalizer<AddressTypeRequest> localizer)
    {
        RuleFor(command => command.Ids).Cascade(CascadeMode.Stop).NotEmpty().WithMessage(localizer[nameof(AddressTypeErrors.NoAddressTypesProvided)]).Must(ids => ids.Count <= MaximumBatchSize).WithMessage(localizer["AddressTypeBatchLimitExceeded"]).Must(ids => ids.Distinct().Count() == ids.Count).WithMessage(localizer["AddressTypeIdsMustBeDistinct"]);
        RuleForEach(command => command.Ids).GreaterThan(0).WithMessage(localizer["AddressTypeIdsMustBePositive"]);
    }
}
public sealed class CreateAddressTypesCommandValidator : AbstractValidator<CreateAddressTypesCommand>
{
    public const int MaximumBatchSize = 100;
    public CreateAddressTypesCommandValidator(IStringLocalizer<AddressTypeRequest> localizer)
    {
        RuleFor(command => command.AddressTypes).Cascade(CascadeMode.Stop).NotEmpty().WithMessage(localizer[nameof(AddressTypeErrors.NoAddressTypesProvided)]).Must(items => items.Count <= MaximumBatchSize).WithMessage(localizer["AddressTypeBatchLimitExceeded"]);
        RuleForEach(command => command.AddressTypes).SetValidator(new AddressTypeMutationValidator<CreateAddressTypeRequest>(localizer));
    }
}

public sealed class CreateAddressTypeCommandHandler(IAddressTypeWriteStore writeStore, IAddressTypeReadStore readStore, IUnitOfWork unitOfWork, IAddressTypeChangeScheduler scheduler, ICurrentActor actor, IMapper mapper, AddressTypeErrors errors) : ICommandHandler<CreateAddressTypeCommand, Result<AddressTypeDetailResponse>>
{
    public async Task<Result<AddressTypeDetailResponse>> Handle(CreateAddressTypeCommand request, CancellationToken cancellationToken)
    {
        var addressType = mapper.Map<AddressType>((AddressTypeMutation)request);
        AddressTypeCompanyScope.Apply(addressType, actor);
        if (await writeStore.HasConflictAsync(addressType, null, cancellationToken)) return Result.Failure<AddressTypeDetailResponse>(errors.AddressTypeExists);
        writeStore.Add(addressType); await unitOfWork.SaveChangesAsync(cancellationToken);
        var response = await readStore.GetByIdAsync(addressType.Id, cancellationToken) ?? throw new InvalidOperationException("The newly created Address Type could not be read.");
        scheduler.Schedule(new AddressTypeChange(response, "Add", null, actor.UserId, addressType.TenantId, addressType.CompanyId, Guid.NewGuid()));
        return Result.Success(response);
    }
}
public sealed class CreateAddressTypesCommandHandler(IAddressTypeWriteStore writeStore, IUnitOfWork unitOfWork, IAddressTypeChangeScheduler scheduler, ICurrentActor actor, IMapper mapper, AddressTypeErrors errors) : ICommandHandler<CreateAddressTypesCommand, Result<CreateAddressTypesResponse>>
{
    public async Task<Result<CreateAddressTypesResponse>> Handle(CreateAddressTypesCommand request, CancellationToken cancellationToken)
    {
        if (request.AddressTypes.Count == 0) return Result.Failure<CreateAddressTypesResponse>(errors.NoAddressTypesProvided);
        var addressTypes = request.AddressTypes.Select(item => mapper.Map<AddressType>((AddressTypeMutation)item)).ToList();
        foreach (var addressType in addressTypes) AddressTypeCompanyScope.Apply(addressType, actor);
        if (HasDuplicates(addressTypes.Select(item => item.NameAr)) || HasDuplicates(addressTypes.Select(item => item.NameEn)) || await writeStore.HasAnyConflictAsync(addressTypes, null, cancellationToken)) return Result.Failure<CreateAddressTypesResponse>(errors.AddressTypeExists);
        writeStore.AddRange(addressTypes); await unitOfWork.SaveChangesAsync(cancellationToken);
        var scope = addressTypes[0];
        scheduler.Schedule(new AddressTypeChange(null, "BulkAdd", addressTypes.Count, actor.UserId, scope.TenantId, scope.CompanyId, Guid.NewGuid()));
        return Result.Success(new CreateAddressTypesResponse(addressTypes.Count));
    }
    private static bool HasDuplicates(IEnumerable<string> values) => values.GroupBy(value => value.Trim(), StringComparer.OrdinalIgnoreCase).Any(group => group.Count() > 1);
}
public sealed class UpdateAddressTypeCommandHandler(IAddressTypeWriteStore writeStore, IUnitOfWork unitOfWork, IAddressTypeChangeScheduler scheduler, IAddressTypeAuditTrail auditTrail, ICurrentActor actor, IMapper mapper, AddressTypeErrors errors) : ICommandHandler<UpdateAddressTypeCommand, Result<AddressTypeDetailResponse>>
{
    public async Task<Result<AddressTypeDetailResponse>> Handle(UpdateAddressTypeCommand request, CancellationToken cancellationToken)
    {
        AddressTypeChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync([GeographicalLifecycleLocks.AddressType(request.Id)], async token =>
        {
            var existing = await writeStore.GetForUpdateAsync(request.Id, token);
            if (existing is null || existing.IsDeleted) return Result.Failure<AddressTypeDetailResponse>(errors.AddressTypeNotFound);
            var updated = mapper.Map<AddressType>((AddressTypeMutation)request);
            if (await writeStore.HasConflictAsync(updated, existing.Id, token)) return Result.Failure<AddressTypeDetailResponse>(errors.AddressTypeExists);
            auditTrail.RecordUpdate(existing, updated); mapper.Map((AddressTypeMutation)request, existing); await unitOfWork.SaveChangesAsync(token);
            var response = mapper.Map<AddressTypeDetailResponse>(existing); change = new AddressTypeChange(response, "Update", null, actor.UserId, existing.TenantId, existing.CompanyId, Guid.NewGuid());
            return Result.Success(response);
        }, cancellationToken);
        if (change is not null) scheduler.Schedule(change); return result;
    }
}
public sealed class ArchiveAddressTypeCommandHandler(IAddressTypeWriteStore writeStore, IUnitOfWork unitOfWork, IAddressTypeChangeScheduler scheduler, ICurrentActor actor, TimeProvider timeProvider, IMapper mapper, AddressTypeErrors errors) : ICommandHandler<ArchiveAddressTypeCommand, Result>
{
    public async Task<Result> Handle(ArchiveAddressTypeCommand request, CancellationToken cancellationToken)
    {
        AddressTypeChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync([GeographicalLifecycleLocks.AddressType(request.Id)], async token =>
        {
            var addressType = await writeStore.GetForUpdateAsync(request.Id, token);
            if (addressType is null) return Result.Failure(errors.AddressTypeNotFound); if (addressType.IsDeleted) return Result.Success();
            if (await writeStore.HasActiveAddressesAsync(addressType.Id, token)) return Result.Failure(errors.AddressTypeInUseByAddress);
            addressType.IsDeleted = true; addressType.DeletedById = actor.UserId; addressType.DeletedByPc = Environment.MachineName; addressType.DeletedOn = timeProvider.GetUtcNow().UtcDateTime; await unitOfWork.SaveChangesAsync(token);
            change = new AddressTypeChange(mapper.Map<AddressTypeDetailResponse>(addressType), "Archive", null, actor.UserId, addressType.TenantId, addressType.CompanyId, Guid.NewGuid()); return Result.Success();
        }, cancellationToken);
        if (change is not null) scheduler.Schedule(change); return result;
    }
}
public sealed class RestoreAddressTypeCommandHandler(IAddressTypeWriteStore writeStore, IUnitOfWork unitOfWork, IAddressTypeChangeScheduler scheduler, ICurrentActor actor, IMapper mapper, AddressTypeErrors errors) : ICommandHandler<RestoreAddressTypeCommand, Result>
{
    public async Task<Result> Handle(RestoreAddressTypeCommand request, CancellationToken cancellationToken)
    {
        AddressTypeChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync([GeographicalLifecycleLocks.AddressType(request.Id)], async token =>
        {
            var addressType = await writeStore.GetForUpdateAsync(request.Id, token);
            if (addressType is null) return Result.Failure(errors.AddressTypeNotFound); if (!addressType.IsDeleted) return Result.Success();
            addressType.IsDeleted = false; addressType.DeletedById = null; addressType.DeletedByPc = null; addressType.DeletedOn = null; await unitOfWork.SaveChangesAsync(token);
            change = new AddressTypeChange(mapper.Map<AddressTypeDetailResponse>(addressType), "Restore", null, actor.UserId, addressType.TenantId, addressType.CompanyId, Guid.NewGuid()); return Result.Success();
        }, cancellationToken);
        if (change is not null) scheduler.Schedule(change); return result;
    }
}
public sealed class BulkArchiveAddressTypesCommandHandler(IAddressTypeWriteStore writeStore, IUnitOfWork unitOfWork, IAddressTypeChangeScheduler scheduler, ICurrentActor actor, TimeProvider timeProvider, AddressTypeErrors errors) : ICommandHandler<BulkArchiveAddressTypesCommand, Result<BulkArchiveAddressTypesResponse>>
{
    public async Task<Result<BulkArchiveAddressTypesResponse>> Handle(BulkArchiveAddressTypesCommand request, CancellationToken cancellationToken)
    {
        AddressTypeChange? change = null;
        var locks = request.Ids.OrderBy(id => id).Select(GeographicalLifecycleLocks.AddressType).ToArray();
        var result = await unitOfWork.ExecuteAtomicallyAsync(locks, async token =>
        {
            var addressTypes = await writeStore.GetForUpdateAsync(request.Ids, token);
            if (addressTypes.Count != request.Ids.Count) return Result.Failure<BulkArchiveAddressTypesResponse>(errors.AddressTypeNotFound);
            var active = addressTypes.Where(item => !item.IsDeleted).ToArray(); if (active.Length == 0) return Result.Success(new BulkArchiveAddressTypesResponse(0));
            if (await writeStore.HasActiveAddressesAsync(active.Select(item => item.Id).ToArray(), token)) return Result.Failure<BulkArchiveAddressTypesResponse>(errors.AddressTypeInUseByAddress);
            var deletedOn = timeProvider.GetUtcNow().UtcDateTime; foreach (var item in active) { item.IsDeleted = true; item.DeletedById = actor.UserId; item.DeletedByPc = Environment.MachineName; item.DeletedOn = deletedOn; }
            await unitOfWork.SaveChangesAsync(token); change = new AddressTypeChange(null, "BulkArchive", active.Length, actor.UserId, active[0].TenantId, active[0].CompanyId, Guid.NewGuid()); return Result.Success(new BulkArchiveAddressTypesResponse(active.Length));
        }, cancellationToken);
        if (change is not null) scheduler.Schedule(change); return result;
    }
}
