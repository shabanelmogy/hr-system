using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Errors;

public class AddressErrors(IStringLocalizer<AddressRequest> localizer)
{
    private readonly IStringLocalizer<AddressRequest> _localizer = localizer;

    public Error AddressExists =>
            new("Address.Duplicated", _localizer[nameof(AddressExists)], StatusCodes.Status409Conflict);

    public Error AddressNotFound =>
            new("Address.AddressNotFound", _localizer[nameof(AddressNotFound)], StatusCodes.Status404NotFound);

    public Error AddressError =>
            new("Address.AddressError", _localizer[nameof(AddressError)], StatusCodes.Status500InternalServerError);

    public Error AddressInUseByOtherEntities =>
            new("Address.AddressInUseByOtherEntities", _localizer[nameof(AddressInUseByOtherEntities)], StatusCodes.Status400BadRequest);

    public Error NoAddressesProvided =>
            new("Address.NoAddressesProvided", _localizer[nameof(NoAddressesProvided)], StatusCodes.Status400BadRequest);

    public Error AddressesInOtherTables =>
            new("Address.AddressesInOtherTables", _localizer[nameof(AddressesInOtherTables)], StatusCodes.Status400BadRequest);

    public Error InvalidCoordinates =>
            new("Address.InvalidCoordinates", _localizer[nameof(InvalidCoordinates)], StatusCodes.Status400BadRequest);

    public Error DefaultAddressCannotBeDeleted =>
            new("Address.DefaultAddressCannotBeDeleted", _localizer[nameof(DefaultAddressCannotBeDeleted)], StatusCodes.Status400BadRequest);
}