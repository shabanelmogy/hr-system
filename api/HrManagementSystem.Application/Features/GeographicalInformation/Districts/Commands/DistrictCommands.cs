using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using MapsterMapper;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Districts.Commands;

public sealed record CreateDistrictCommand(string NameAr, string NameEn, string Code, int StateId)
    : DistrictMutation(NameAr, NameEn, Code, StateId), ICommand<Result<DistrictDetailResponse>>;

public sealed record UpdateDistrictCommand(int Id, string NameAr, string NameEn, string Code, int StateId)
    : DistrictMutation(NameAr, NameEn, Code, StateId), ICommand<Result<DistrictDetailResponse>>;

public sealed record ArchiveDistrictCommand(int Id) : ICommand<Result>;
public sealed record RestoreDistrictCommand(int Id) : ICommand<Result>;
public sealed record BulkArchiveDistrictsCommand(IReadOnlyList<int> Ids) : ICommand<Result<BulkArchiveDistrictsResponse>>;
public sealed record CreateDistrictsCommand(IReadOnlyList<CreateDistrictRequest> Districts) : ICommand<Result<CreateDistrictsResponse>>;

public class DistrictMutationValidator<TMutation> : AbstractValidator<TMutation> where TMutation : DistrictMutation
{
    public DistrictMutationValidator(IStringLocalizer<CreateDistrictRequest> localizer)
    {
        RuleFor(district => district.NameEn)
            .GeographicalName(localizer, Strings.NameEn);
        RuleFor(district => district.NameAr)
            .GeographicalName(localizer, Strings.NameAr);
        RuleFor(district => district.Code)
            .Trimmed().NotEmpty().WithName(Strings.Code).WithMessage(localizer[Strings.Required])
            .Length(2, 10).WithMessage(localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.StateCode).WithMessage(localizer[Strings.InvalidValues]);
        RuleFor(district => district.StateId).GreaterThan(0).WithName(Strings.State).WithMessage(localizer[Strings.Required]);
    }
}

public sealed class CreateDistrictCommandValidator : DistrictMutationValidator<CreateDistrictCommand>
{
    public CreateDistrictCommandValidator(IStringLocalizer<CreateDistrictRequest> localizer) : base(localizer) { }
}

public sealed class UpdateDistrictCommandValidator : DistrictMutationValidator<UpdateDistrictCommand>
{
    public UpdateDistrictCommandValidator(IStringLocalizer<CreateDistrictRequest> localizer) : base(localizer)
    {
        RuleFor(command => command.Id).GreaterThan(0);
    }
}

public sealed class ArchiveDistrictCommandValidator : AbstractValidator<ArchiveDistrictCommand>
{
    public ArchiveDistrictCommandValidator() => RuleFor(command => command.Id).GreaterThan(0);
}

public sealed class RestoreDistrictCommandValidator : AbstractValidator<RestoreDistrictCommand>
{
    public RestoreDistrictCommandValidator() => RuleFor(command => command.Id).GreaterThan(0);
}

public sealed class BulkArchiveDistrictsCommandValidator : AbstractValidator<BulkArchiveDistrictsCommand>
{
    public const int MaximumBatchSize = 100;

    public BulkArchiveDistrictsCommandValidator(IStringLocalizer<CreateDistrictRequest> localizer)
    {
        RuleFor(command => command.Ids)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer[nameof(DistrictErrors.NoDistrictsProvided)])
            .Must(ids => ids.Count <= MaximumBatchSize).WithMessage(localizer["DistrictBatchLimitExceeded"])
            .Must(ids => ids.Distinct().Count() == ids.Count).WithMessage(localizer["DistrictIdsMustBeDistinct"]);
        RuleForEach(command => command.Ids).GreaterThan(0).WithMessage(localizer["DistrictIdsMustBePositive"]);
    }
}

public sealed class CreateDistrictsCommandValidator : AbstractValidator<CreateDistrictsCommand>
{
    public const int MaximumBatchSize = 100;

    public CreateDistrictsCommandValidator(IStringLocalizer<CreateDistrictRequest> localizer)
    {
        RuleFor(command => command.Districts)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer[nameof(DistrictErrors.NoDistrictsProvided)])
            .Must(districts => districts.Count <= MaximumBatchSize).WithMessage(localizer["DistrictBatchLimitExceeded"]);

        RuleForEach(command => command.Districts)
            .SetValidator(new DistrictMutationValidator<CreateDistrictRequest>(localizer));
    }
}

public sealed class CreateDistrictCommandHandler(
    IDistrictWriteStore districtWriteStore,
    IDistrictReadStore districtReadStore,
    IUnitOfWork unitOfWork,
    IDistrictChangeScheduler districtChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    DistrictErrors districtErrors)
    : ICommandHandler<CreateDistrictCommand, Result<DistrictDetailResponse>>
{
    public async Task<Result<DistrictDetailResponse>> Handle(CreateDistrictCommand request, CancellationToken cancellationToken)
    {
        DistrictChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [GeographicalLifecycleLocks.State(request.StateId)],
            async token =>
            {
                if (!await districtWriteStore.IsStateActiveAsync(request.StateId, token))
                    return Result.Failure<DistrictDetailResponse>(districtErrors.StateNotFound);

                var district = mapper.Map<District>((DistrictMutation)request);
                if (await districtWriteStore.HasConflictAsync(district, null, token))
                    return Result.Failure<DistrictDetailResponse>(districtErrors.DistrictExists);

                districtWriteStore.Add(district);
                await unitOfWork.SaveChangesAsync(token);
                var response = await districtReadStore.GetByIdAsync(district.Id, token)
                    ?? throw new InvalidOperationException("The newly created District could not be read.");
                change = new DistrictChange(response, "Add", null, currentActor.UserId, Guid.NewGuid());
                return Result.Success(response);
            },
            cancellationToken);

        if (change is not null)
            districtChangeScheduler.Schedule(change);

        return result;
    }
}

public sealed class CreateDistrictsCommandHandler(
    IDistrictWriteStore districtWriteStore,
    IUnitOfWork unitOfWork,
    IDistrictChangeScheduler districtChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    DistrictErrors districtErrors)
    : ICommandHandler<CreateDistrictsCommand, Result<CreateDistrictsResponse>>
{
    public async Task<Result<CreateDistrictsResponse>> Handle(CreateDistrictsCommand request, CancellationToken cancellationToken)
    {
        if (request.Districts.Count == 0)
            return Result.Failure<CreateDistrictsResponse>(districtErrors.NoDistrictsProvided);

        var districts = request.Districts
            .Select(district => mapper.Map<District>((DistrictMutation)district))
            .ToList();
        DistrictChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            districts.Select(district => district.StateId)
                .Distinct()
                .Select(GeographicalLifecycleLocks.State)
                .ToArray(),
            async token =>
            {
                if (!await districtWriteStore.AreStatesActiveAsync(
                        districts.Select(district => district.StateId).ToList(),
                        token))
                {
                    return Result.Failure<CreateDistrictsResponse>(districtErrors.StateNotFound);
                }
                if (HasDuplicates(districts) ||
                    await districtWriteStore.HasAnyConflictAsync(districts, token))
                {
                    return Result.Failure<CreateDistrictsResponse>(districtErrors.DistrictExists);
                }

                districtWriteStore.AddRange(districts);
                await unitOfWork.SaveChangesAsync(token);
                change = new DistrictChange(
                    null,
                    "BulkAdd",
                    districts.Count,
                    currentActor.UserId,
                    Guid.NewGuid());

                return Result.Success(new CreateDistrictsResponse(districts.Count));
            },
            cancellationToken);

        if (change is not null)
            districtChangeScheduler.Schedule(change);

        return result;
    }

    private static bool HasDuplicates(IReadOnlyList<District> districts)
        => HasDuplicates(districts.Select(district => (district.StateId, district.NameAr))) ||
           HasDuplicates(districts.Select(district => (district.StateId, district.NameEn))) ||
           HasDuplicates(districts.Select(district => (district.StateId, district.Code)));

    private static bool HasDuplicates(IEnumerable<(int StateId, string Value)> values)
    {
        var seen = new HashSet<(int StateId, string Value)>(StateValueComparer.Instance);
        return values.Any(value => !seen.Add(value));
    }

    private sealed class StateValueComparer : IEqualityComparer<(int StateId, string Value)>
    {
        public static readonly StateValueComparer Instance = new();

        public bool Equals((int StateId, string Value) x, (int StateId, string Value) y) =>
            x.StateId == y.StateId &&
            string.Equals(x.Value, y.Value, StringComparison.OrdinalIgnoreCase);

        public int GetHashCode((int StateId, string Value) item) =>
            HashCode.Combine(item.StateId, item.Value.ToLowerInvariant());
    }
}

public sealed class UpdateDistrictCommandHandler(
    IDistrictWriteStore districtWriteStore,
    IUnitOfWork unitOfWork,
    IDistrictChangeScheduler districtChangeScheduler,
    IDistrictAuditTrail districtAuditTrail,
    ICurrentActor currentActor,
    IMapper mapper,
    DistrictErrors districtErrors)
    : ICommandHandler<UpdateDistrictCommand, Result<DistrictDetailResponse>>
{
    public async Task<Result<DistrictDetailResponse>> Handle(UpdateDistrictCommand request, CancellationToken cancellationToken)
    {
        while (true)
        {
            var expectedStateId = await districtWriteStore.GetStateIdAsync(request.Id, cancellationToken);
            if (!expectedStateId.HasValue)
                return Result.Failure<DistrictDetailResponse>(districtErrors.DistrictNotFound);

            var retryWithCurrentParent = false;
            DistrictChange? change = null;
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                [GeographicalLifecycleLocks.State(expectedStateId.Value), GeographicalLifecycleLocks.State(request.StateId)],
                async token =>
                {
                    var district = await districtWriteStore.GetForUpdateAsync(request.Id, token);
                    if (district is null || district.IsDeleted)
                        return Result.Failure<DistrictDetailResponse>(districtErrors.DistrictNotFound);
                    if (district.StateId != expectedStateId.Value)
                    {
                        retryWithCurrentParent = true;
                        return Result.Success<DistrictDetailResponse>(null!);
                    }
                    if (!await districtWriteStore.IsStateActiveAsync(request.StateId, token))
                        return Result.Failure<DistrictDetailResponse>(districtErrors.StateNotFound);

                    var updatedDistrict = mapper.Map<District>((DistrictMutation)request);
                    if (await districtWriteStore.HasConflictAsync(updatedDistrict, district.Id, token))
                        return Result.Failure<DistrictDetailResponse>(districtErrors.DistrictExists);

                    districtAuditTrail.RecordUpdate(district, updatedDistrict);
                    mapper.Map((DistrictMutation)request, district);
                    await unitOfWork.SaveChangesAsync(token);
                    var response = mapper.Map<DistrictDetailResponse>(district);
                    change = new DistrictChange(response, "Update", null, currentActor.UserId, Guid.NewGuid());
                    return Result.Success(response);
                },
                cancellationToken);

            if (retryWithCurrentParent)
                continue;

            if (change is not null)
                districtChangeScheduler.Schedule(change);

            return result;
        }
    }
}

public sealed class ArchiveDistrictCommandHandler(
    IDistrictWriteStore districtWriteStore,
    IUnitOfWork unitOfWork,
    IDistrictChangeScheduler districtChangeScheduler,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    IMapper mapper,
    DistrictErrors districtErrors)
    : ICommandHandler<ArchiveDistrictCommand, Result>
{
    public async Task<Result> Handle(ArchiveDistrictCommand request, CancellationToken cancellationToken)
    {
        while (true)
        {
            var expectedStateId = await districtWriteStore.GetStateIdAsync(request.Id, cancellationToken);
            if (!expectedStateId.HasValue)
                return Result.Failure(districtErrors.DistrictNotFound);

            var retryWithCurrentParent = false;
            DistrictChange? change = null;
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                [GeographicalLifecycleLocks.State(expectedStateId.Value)],
                async token =>
                {
                    var district = await districtWriteStore.GetForUpdateAsync(request.Id, token);
                    if (district is null) return Result.Failure(districtErrors.DistrictNotFound);
                    if (district.StateId != expectedStateId.Value)
                    {
                        retryWithCurrentParent = true;
                        return Result.Success();
                    }
                    if (district.IsDeleted) return Result.Success();
                    if (await districtWriteStore.HasActiveAddressesAsync(district.Id, token))
                        return Result.Failure(districtErrors.DistrictInUseByAddress);

                    district.IsDeleted = true;
                    district.DeletedById = currentActor.UserId;
                    district.DeletedByPc = Environment.MachineName;
                    district.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
                    await unitOfWork.SaveChangesAsync(token);
                    change = new DistrictChange(
                        mapper.Map<DistrictDetailResponse>(district),
                        "Archive",
                        null,
                        currentActor.UserId,
                        Guid.NewGuid());
                    return Result.Success();
                },
                cancellationToken);

            if (retryWithCurrentParent)
                continue;

            if (change is not null)
                districtChangeScheduler.Schedule(change);

            return result;
        }
    }
}

public sealed class RestoreDistrictCommandHandler(
    IDistrictWriteStore districtWriteStore,
    IUnitOfWork unitOfWork,
    IDistrictChangeScheduler districtChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    DistrictErrors districtErrors)
    : ICommandHandler<RestoreDistrictCommand, Result>
{
    public async Task<Result> Handle(RestoreDistrictCommand request, CancellationToken cancellationToken)
    {
        while (true)
        {
            var expectedStateId = await districtWriteStore.GetStateIdAsync(request.Id, cancellationToken);
            if (!expectedStateId.HasValue)
                return Result.Failure(districtErrors.DistrictNotFound);

            var retryWithCurrentParent = false;
            DistrictChange? change = null;
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                [GeographicalLifecycleLocks.State(expectedStateId.Value)],
                async token =>
                {
                    var district = await districtWriteStore.GetForUpdateAsync(request.Id, token);
                    if (district is null) return Result.Failure(districtErrors.DistrictNotFound);
                    if (district.StateId != expectedStateId.Value)
                    {
                        retryWithCurrentParent = true;
                        return Result.Success();
                    }
                    if (!district.IsDeleted) return Result.Success();
                    if (!await districtWriteStore.IsStateActiveAsync(district.StateId, token))
                        return Result.Failure(districtErrors.StateNotFound);

                    district.IsDeleted = false;
                    district.DeletedById = null;
                    district.DeletedByPc = null;
                    district.DeletedOn = null;
                    await unitOfWork.SaveChangesAsync(token);
                    change = new DistrictChange(
                        mapper.Map<DistrictDetailResponse>(district),
                        "Restore",
                        null,
                        currentActor.UserId,
                        Guid.NewGuid());
                    return Result.Success();
                },
                cancellationToken);

            if (retryWithCurrentParent)
                continue;

            if (change is not null)
                districtChangeScheduler.Schedule(change);

            return result;
        }
    }
}

public sealed class BulkArchiveDistrictsCommandHandler(
    IDistrictWriteStore districtWriteStore,
    IUnitOfWork unitOfWork,
    IDistrictChangeScheduler districtChangeScheduler,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    DistrictErrors districtErrors)
    : ICommandHandler<BulkArchiveDistrictsCommand, Result<BulkArchiveDistrictsResponse>>
{
    public async Task<Result<BulkArchiveDistrictsResponse>> Handle(BulkArchiveDistrictsCommand request, CancellationToken cancellationToken)
    {
        while (true)
        {
            var expectedStateIds = await districtWriteStore.GetStateIdsAsync(request.Ids, cancellationToken);
            if (expectedStateIds.Count != request.Ids.Count)
                return Result.Failure<BulkArchiveDistrictsResponse>(districtErrors.DistrictNotFound);

            var retryWithCurrentParent = false;
            DistrictChange? change = null;
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                expectedStateIds.Values.Distinct().Select(GeographicalLifecycleLocks.State).ToArray(),
                async token =>
                {
                    var districts = await districtWriteStore.GetForUpdateAsync(request.Ids, token);
                    if (districts.Count != request.Ids.Count)
                        return Result.Failure<BulkArchiveDistrictsResponse>(districtErrors.DistrictNotFound);
                    if (districts.Any(district =>
                            !expectedStateIds.TryGetValue(district.Id, out var expectedStateId) ||
                            district.StateId != expectedStateId))
                    {
                        retryWithCurrentParent = true;
                        return Result.Success(new BulkArchiveDistrictsResponse(0));
                    }

                    var activeDistricts = districts.Where(district => !district.IsDeleted).ToArray();
                    if (activeDistricts.Length == 0)
                        return Result.Success(new BulkArchiveDistrictsResponse(0));
                    if (await districtWriteStore.HasActiveAddressesAsync(activeDistricts.Select(district => district.Id).ToArray(), token))
                        return Result.Failure<BulkArchiveDistrictsResponse>(districtErrors.DistrictInUseByAddress);

                    var deletedOn = timeProvider.GetUtcNow().UtcDateTime;
                    foreach (var district in activeDistricts)
                    {
                        district.IsDeleted = true;
                        district.DeletedById = currentActor.UserId;
                        district.DeletedByPc = Environment.MachineName;
                        district.DeletedOn = deletedOn;
                    }

                    await unitOfWork.SaveChangesAsync(token);
                    change = new DistrictChange(
                        null,
                        "BulkArchive",
                        activeDistricts.Length,
                        currentActor.UserId,
                        Guid.NewGuid());
                    return Result.Success(new BulkArchiveDistrictsResponse(activeDistricts.Length));
                },
                cancellationToken);

            if (retryWithCurrentParent)
                continue;

            if (change is not null)
                districtChangeScheduler.Schedule(change);

            return result;
        }
    }
}
