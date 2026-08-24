using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Errors;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using MapsterMapper;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Commands;

public sealed record CreateStateCommand(string NameAr, string NameEn, string Code, int CountryId)
    : StateMutation(NameAr, NameEn, Code, CountryId), ICommand<Result<StateDetailResponse>>;

public sealed record UpdateStateCommand(int Id, string NameAr, string NameEn, string Code, int CountryId)
    : StateMutation(NameAr, NameEn, Code, CountryId), ICommand<Result<StateDetailResponse>>;

public sealed record ArchiveStateCommand(int Id) : ICommand<Result>;
public sealed record RestoreStateCommand(int Id) : ICommand<Result>;
public sealed record BulkArchiveStatesCommand(IReadOnlyList<int> Ids) : ICommand<Result<BulkArchiveStatesResponse>>;
public sealed record CreateStatesCommand(IReadOnlyList<CreateStateRequest> States) : ICommand<Result<CreateStatesResponse>>;

public class StateMutationValidator<TMutation> : AbstractValidator<TMutation> where TMutation : StateMutation
{
    public StateMutationValidator(IStringLocalizer<CreateStateRequest> localizer)
    {
        RuleFor(state => state.NameEn)
            .Trimmed().NotEmpty().WithName(Strings.NameEn).WithMessage(localizer[Strings.Required])
            .Length(2, 100).WithMessage(localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.EnglishLettersAndSpaces).WithMessage(localizer[Strings.EnglishLetterOnly]);
        RuleFor(state => state.NameAr)
            .Trimmed().NotEmpty().WithName(Strings.NameAr).WithMessage(localizer[Strings.Required])
            .Length(2, 100).WithMessage(localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.ArabicLettersAndSpaces).WithMessage(localizer[Strings.ArabicLetterOnly]);
        RuleFor(state => state.Code)
            .Trimmed().NotEmpty().WithName(Strings.Code).WithMessage(localizer[Strings.Required])
            .Length(2, 10).WithMessage(localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.StateCode).WithMessage(localizer[Strings.InvalidValues]);
        RuleFor(state => state.CountryId).GreaterThan(0).WithName(Strings.Country).WithMessage(localizer[Strings.Required]);
    }
}

public sealed class CreateStateCommandValidator : StateMutationValidator<CreateStateCommand>
{
    public CreateStateCommandValidator(IStringLocalizer<CreateStateRequest> localizer) : base(localizer) { }
}

public sealed class UpdateStateCommandValidator : StateMutationValidator<UpdateStateCommand>
{
    public UpdateStateCommandValidator(IStringLocalizer<CreateStateRequest> localizer) : base(localizer)
    {
        RuleFor(command => command.Id).GreaterThan(0);
    }
}

public sealed class ArchiveStateCommandValidator : AbstractValidator<ArchiveStateCommand>
{
    public ArchiveStateCommandValidator() => RuleFor(command => command.Id).GreaterThan(0);
}

public sealed class RestoreStateCommandValidator : AbstractValidator<RestoreStateCommand>
{
    public RestoreStateCommandValidator() => RuleFor(command => command.Id).GreaterThan(0);
}

public sealed class BulkArchiveStatesCommandValidator : AbstractValidator<BulkArchiveStatesCommand>
{
    public const int MaximumBatchSize = 100;

    public BulkArchiveStatesCommandValidator(IStringLocalizer<CreateStateRequest> localizer)
    {
        RuleFor(command => command.Ids)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer[nameof(StateErrors.NoStatesProvided)])
            .Must(ids => ids.Count <= MaximumBatchSize).WithMessage(localizer["StateBatchLimitExceeded"])
            .Must(ids => ids.Distinct().Count() == ids.Count).WithMessage(localizer["StateIdsMustBeDistinct"]);
        RuleForEach(command => command.Ids).GreaterThan(0).WithMessage(localizer["StateIdsMustBePositive"]);
    }
}

public sealed class CreateStatesCommandValidator : AbstractValidator<CreateStatesCommand>
{
    public const int MaximumBatchSize = 100;

    public CreateStatesCommandValidator(IStringLocalizer<CreateStateRequest> localizer)
    {
        RuleFor(command => command.States)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer[nameof(StateErrors.NoStatesProvided)])
            .Must(states => states.Count <= MaximumBatchSize).WithMessage(localizer["StateBatchLimitExceeded"]);

        RuleForEach(command => command.States)
            .SetValidator(new StateMutationValidator<CreateStateRequest>(localizer));
    }
}

public sealed class CreateStateCommandHandler(
    IStateWriteStore stateWriteStore,
    IStateReadStore stateReadStore,
    IUnitOfWork unitOfWork,
    IStateChangeScheduler stateChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    StateErrors stateErrors)
    : ICommandHandler<CreateStateCommand, Result<StateDetailResponse>>
{
    public async Task<Result<StateDetailResponse>> Handle(CreateStateCommand request, CancellationToken cancellationToken)
    {
        if (!await stateWriteStore.IsCountryActiveAsync(request.CountryId, cancellationToken))
            return Result.Failure<StateDetailResponse>(stateErrors.CountryNotFound);

        var state = mapper.Map<State>((StateMutation)request);
        if (await stateWriteStore.HasConflictAsync(state, null, cancellationToken))
            return Result.Failure<StateDetailResponse>(stateErrors.StateExists);

        stateWriteStore.Add(state);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var response = await stateReadStore.GetByIdAsync(state.Id, cancellationToken)
            ?? throw new InvalidOperationException("The newly created State could not be read.");
        stateChangeScheduler.Schedule(new StateChange(response, "Add", null, currentActor.UserId, Guid.NewGuid()));
        return Result.Success(response);
    }
}

public sealed class CreateStatesCommandHandler(
    IStateWriteStore stateWriteStore,
    IUnitOfWork unitOfWork,
    IStateChangeScheduler stateChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    StateErrors stateErrors)
    : ICommandHandler<CreateStatesCommand, Result<CreateStatesResponse>>
{
    public async Task<Result<CreateStatesResponse>> Handle(CreateStatesCommand request, CancellationToken cancellationToken)
    {
        if (request.States.Count == 0)
            return Result.Failure<CreateStatesResponse>(stateErrors.NoStatesProvided);

        var states = request.States
            .Select(state => mapper.Map<State>((StateMutation)state))
            .ToList();
        if (!await stateWriteStore.AreCountriesActiveAsync(
                states.Select(state => state.CountryId).ToList(),
                cancellationToken))
        {
            return Result.Failure<CreateStatesResponse>(stateErrors.CountryNotFound);
        }
        if (HasDuplicates(states) ||
            await stateWriteStore.HasAnyConflictAsync(states, cancellationToken))
        {
            return Result.Failure<CreateStatesResponse>(stateErrors.StateExists);
        }

        stateWriteStore.AddRange(states);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        stateChangeScheduler.Schedule(new StateChange(
            null,
            "BulkAdd",
            states.Count,
            currentActor.UserId,
            Guid.NewGuid()));

        return Result.Success(new CreateStatesResponse(states.Count));
    }

    private static bool HasDuplicates(IReadOnlyList<State> states)
        => HasDuplicates(states.Select(state => (state.CountryId, state.NameAr))) ||
           HasDuplicates(states.Select(state => (state.CountryId, state.NameEn))) ||
           HasDuplicates(states.Select(state => (state.CountryId, state.Code)));

    private static bool HasDuplicates(IEnumerable<(int CountryId, string Value)> values)
    {
        var seen = new HashSet<(int CountryId, string Value)>(CountryValueComparer.Instance);
        return values.Any(value => !seen.Add(value));
    }

    private sealed class CountryValueComparer : IEqualityComparer<(int CountryId, string Value)>
    {
        public static readonly CountryValueComparer Instance = new();

        public bool Equals((int CountryId, string Value) x, (int CountryId, string Value) y) =>
            x.CountryId == y.CountryId &&
            string.Equals(x.Value, y.Value, StringComparison.OrdinalIgnoreCase);

        public int GetHashCode((int CountryId, string Value) item) =>
            HashCode.Combine(item.CountryId, item.Value.ToLowerInvariant());
    }
}

public sealed class UpdateStateCommandHandler(
    IStateWriteStore stateWriteStore,
    IUnitOfWork unitOfWork,
    IStateChangeScheduler stateChangeScheduler,
    IStateAuditTrail stateAuditTrail,
    ICurrentActor currentActor,
    IMapper mapper,
    StateErrors stateErrors)
    : ICommandHandler<UpdateStateCommand, Result<StateDetailResponse>>
{
    public async Task<Result<StateDetailResponse>> Handle(UpdateStateCommand request, CancellationToken cancellationToken)
    {
        var state = await stateWriteStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (state is null || state.IsDeleted)
            return Result.Failure<StateDetailResponse>(stateErrors.StateNotFound);
        if (!await stateWriteStore.IsCountryActiveAsync(request.CountryId, cancellationToken))
            return Result.Failure<StateDetailResponse>(stateErrors.CountryNotFound);

        var updatedState = mapper.Map<State>((StateMutation)request);
        if (await stateWriteStore.HasConflictAsync(updatedState, state.Id, cancellationToken))
            return Result.Failure<StateDetailResponse>(stateErrors.StateExists);

        stateAuditTrail.RecordUpdate(state, updatedState);
        mapper.Map((StateMutation)request, state);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var response = mapper.Map<StateDetailResponse>(state);
        stateChangeScheduler.Schedule(new StateChange(response, "Update", null, currentActor.UserId, Guid.NewGuid()));
        return Result.Success(response);
    }
}

public sealed class ArchiveStateCommandHandler(
    IStateWriteStore stateWriteStore,
    IUnitOfWork unitOfWork,
    IStateChangeScheduler stateChangeScheduler,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    IMapper mapper,
    StateErrors stateErrors)
    : ICommandHandler<ArchiveStateCommand, Result>
{
    public async Task<Result> Handle(ArchiveStateCommand request, CancellationToken cancellationToken)
    {
        var state = await stateWriteStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (state is null) return Result.Failure(stateErrors.StateNotFound);
        if (state.IsDeleted) return Result.Success();
        if (await stateWriteStore.HasActiveDistrictsAsync(state.Id, cancellationToken))
            return Result.Failure(stateErrors.StateInUseByDistrict);

        state.IsDeleted = true;
        state.DeletedById = currentActor.UserId;
        state.DeletedByPc = Environment.MachineName;
        state.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        stateChangeScheduler.Schedule(new StateChange(mapper.Map<StateDetailResponse>(state), "Archive", null, currentActor.UserId, Guid.NewGuid()));
        return Result.Success();
    }
}

public sealed class RestoreStateCommandHandler(
    IStateWriteStore stateWriteStore,
    IUnitOfWork unitOfWork,
    IStateChangeScheduler stateChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    StateErrors stateErrors)
    : ICommandHandler<RestoreStateCommand, Result>
{
    public async Task<Result> Handle(RestoreStateCommand request, CancellationToken cancellationToken)
    {
        var state = await stateWriteStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (state is null) return Result.Failure(stateErrors.StateNotFound);
        if (!state.IsDeleted) return Result.Success();
        if (!await stateWriteStore.IsCountryActiveAsync(state.CountryId, cancellationToken))
            return Result.Failure(stateErrors.CountryNotFound);

        state.IsDeleted = false;
        state.DeletedById = null;
        state.DeletedByPc = null;
        state.DeletedOn = null;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        stateChangeScheduler.Schedule(new StateChange(mapper.Map<StateDetailResponse>(state), "Restore", null, currentActor.UserId, Guid.NewGuid()));
        return Result.Success();
    }
}

public sealed class BulkArchiveStatesCommandHandler(
    IStateWriteStore stateWriteStore,
    IUnitOfWork unitOfWork,
    IStateChangeScheduler stateChangeScheduler,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    StateErrors stateErrors)
    : ICommandHandler<BulkArchiveStatesCommand, Result<BulkArchiveStatesResponse>>
{
    public async Task<Result<BulkArchiveStatesResponse>> Handle(BulkArchiveStatesCommand request, CancellationToken cancellationToken)
    {
        var states = await stateWriteStore.GetForUpdateAsync(request.Ids, cancellationToken);
        if (states.Count != request.Ids.Count)
            return Result.Failure<BulkArchiveStatesResponse>(stateErrors.StateNotFound);

        var activeStates = states.Where(state => !state.IsDeleted).ToArray();
        if (activeStates.Length == 0)
            return Result.Success(new BulkArchiveStatesResponse(0));
        if (await stateWriteStore.HasActiveDistrictsAsync(activeStates.Select(state => state.Id).ToArray(), cancellationToken))
            return Result.Failure<BulkArchiveStatesResponse>(stateErrors.StateInUseByDistrict);

        var deletedOn = timeProvider.GetUtcNow().UtcDateTime;
        foreach (var state in activeStates)
        {
            state.IsDeleted = true;
            state.DeletedById = currentActor.UserId;
            state.DeletedByPc = Environment.MachineName;
            state.DeletedOn = deletedOn;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        stateChangeScheduler.Schedule(new StateChange(null, "BulkArchive", activeStates.Length, currentActor.UserId, Guid.NewGuid()));
        return Result.Success(new BulkArchiveStatesResponse(activeStates.Length));
    }
}
