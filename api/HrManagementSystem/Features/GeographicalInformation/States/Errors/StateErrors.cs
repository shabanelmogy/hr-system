using HrManagementSystem.Features.GeographicalInformation.States.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.States.Errors;

public class StateErrors(IStringLocalizer<StateRequest> localizer)
{
    private readonly IStringLocalizer<StateRequest> _localizer = localizer;

    public Error StateExists =>
            new("State.Duplicated", _localizer[nameof(StateExists)], StatusCodes.Status409Conflict);

    public Error StateNotFound =>
            new("State.StateNotFound", _localizer[nameof(StateNotFound)], StatusCodes.Status404NotFound);

    public Error StateError =>
            new("State.StateError", _localizer[nameof(StateError)], StatusCodes.Status500InternalServerError);

    public Error InvalidStateId =>
            new("State.InvalidStateId", _localizer[nameof(InvalidStateId)], StatusCodes.Status400BadRequest);

    public Error StateInUseByDistrict =>
            new("State.StateInUseByDistrict", _localizer[nameof(StateInUseByDistrict)], StatusCodes.Status400BadRequest);

    public Error StateInUseByCountry =>
            new("State.StateInUseByCountry", _localizer[nameof(StateInUseByCountry)], StatusCodes.Status400BadRequest);

}
