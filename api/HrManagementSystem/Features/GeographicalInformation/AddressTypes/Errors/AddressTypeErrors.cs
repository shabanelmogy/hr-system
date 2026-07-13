using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Errors;

public class AddressTypeErrors(IStringLocalizer<AddressTypeRequest> localizer)
{
    private readonly IStringLocalizer<AddressTypeRequest> _localizer = localizer;

    public Error AddressTypeExists =>
            new("AddressType.Duplicated", _localizer[nameof(AddressTypeExists)], StatusCodes.Status409Conflict);

    public Error AddressTypeNotFound =>
            new("AddressType.AddressTypeNotFound", _localizer[nameof(AddressTypeNotFound)], StatusCodes.Status404NotFound);

    public Error AddressTypeError =>
            new("AddressType.AddressTypeError", _localizer[nameof(AddressTypeError)], StatusCodes.Status500InternalServerError);

    public Error AddressTypeInUseByAddress =>
            new("AddressType.AddressTypeInUseByAddress", _localizer[nameof(AddressTypeInUseByAddress)], StatusCodes.Status400BadRequest);

    public Error NoAddressTypesProvided =>
            new("AddressType.NoAddressTypesProvided", _localizer[nameof(NoAddressTypesProvided)], StatusCodes.Status400BadRequest);

    public Error AddressTypesInOtherTables =>
            new("AddressType.AddressTypesInAddresses", _localizer[nameof(AddressTypesInOtherTables)], StatusCodes.Status400BadRequest);
}