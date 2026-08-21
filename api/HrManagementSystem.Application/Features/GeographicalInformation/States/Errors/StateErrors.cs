using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Errors;

public class StateErrors(IStringLocalizer<CreateStateRequest> localizer)
{
    private readonly IStringLocalizer<CreateStateRequest> _localizer = localizer;

    public Error StateExists =>
            new("State.Duplicated", _localizer[nameof(StateExists)], ErrorType.Conflict);

    public Error StateNotFound =>
            new("State.StateNotFound", _localizer[nameof(StateNotFound)], ErrorType.NotFound);

    public Error StateError =>
            new("State.StateError", _localizer[nameof(StateError)], ErrorType.Unexpected);

    public Error InvalidStateId =>
            new("State.InvalidStateId", _localizer[nameof(InvalidStateId)], ErrorType.Validation);

    public Error StateInUseByDistrict =>
            new("State.StateInUseByDistrict", _localizer[nameof(StateInUseByDistrict)], ErrorType.Validation);

    public Error StateInUseByCountry =>
            new("State.StateInUseByCountry", _localizer[nameof(StateInUseByCountry)], ErrorType.Validation);

    public Error CountryNotFound =>
            new("State.CountryNotFound", _localizer["CountryNotFound"], ErrorType.NotFound);

    public Error NoStatesProvided =>
            new("State.NoStatesProvided", _localizer[nameof(NoStatesProvided)], ErrorType.Validation);

}
