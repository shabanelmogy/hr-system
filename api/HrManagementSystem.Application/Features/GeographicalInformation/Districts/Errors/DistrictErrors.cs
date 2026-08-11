using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;

public class DistrictErrors(IStringLocalizer<DistrictRequest> localizer)
{
    private readonly IStringLocalizer<DistrictRequest> _localizer = localizer;

    public Error DistrictExists =>
            new("District.Duplicated", _localizer[nameof(DistrictExists)], ErrorType.Conflict);

    public Error DistrictNotFound =>
            new("District.DistrictNotFound", _localizer[nameof(DistrictNotFound)], ErrorType.NotFound);

    public Error DistrictError =>
            new("District.DistrictError", _localizer[nameof(DistrictError)], ErrorType.Unexpected);

    public Error DistrictInUseByAddress =>
            new("District.DistrictInUseByAddress", _localizer[nameof(DistrictInUseByAddress)], ErrorType.Validation);

    public Error DistrictInUseByState =>
            new("District.DistrictInUseByState", _localizer[nameof(DistrictInUseByState)], ErrorType.Validation);

    public Error StateNotFound =>
            new("District.StateNotFound", _localizer[nameof(StateNotFound)], ErrorType.NotFound);
}
