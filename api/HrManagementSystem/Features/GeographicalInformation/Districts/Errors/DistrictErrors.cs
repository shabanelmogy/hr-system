using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Errors;

public class DistrictErrors(IStringLocalizer<DistrictRequest> localizer)
{
    private readonly IStringLocalizer<DistrictRequest> _localizer = localizer;

    public Error DistrictExists =>
            new("District.Duplicated", _localizer[nameof(DistrictExists)], StatusCodes.Status409Conflict);

    public Error DistrictNotFound =>
            new("District.DistrictNotFound", _localizer[nameof(DistrictNotFound)], StatusCodes.Status404NotFound);

    public Error DistrictError =>
            new("District.DistrictError", _localizer[nameof(DistrictError)], StatusCodes.Status500InternalServerError);

    public Error DistrictInUseByAddress =>
            new("District.DistrictInUseByAddress", _localizer[nameof(DistrictInUseByAddress)], StatusCodes.Status400BadRequest);

    public Error DistrictInUseByState =>
            new("District.DistrictInUseByState", _localizer[nameof(DistrictInUseByState)], StatusCodes.Status400BadRequest);

    public Error StateNotFound =>
            new("District.StateNotFound", _localizer[nameof(StateNotFound)], StatusCodes.Status404NotFound);
}
