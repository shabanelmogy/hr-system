using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Errors;

public class AddressTypeErrors(IStringLocalizer<AddressTypeRequest> localizer)
{
    private readonly IStringLocalizer<AddressTypeRequest> _localizer = localizer;

    public Error AddressTypeExists =>
            new("AddressType.Duplicated", _localizer[nameof(AddressTypeExists)], ErrorType.Conflict);

    public Error AddressTypeNotFound =>
            new("AddressType.AddressTypeNotFound", _localizer[nameof(AddressTypeNotFound)], ErrorType.NotFound);

    public Error AddressTypeError =>
            new("AddressType.AddressTypeError", _localizer[nameof(AddressTypeError)], ErrorType.Unexpected);

    public Error AddressTypeInUseByAddress =>
            new("AddressType.AddressTypeInUseByAddress", _localizer[nameof(AddressTypeInUseByAddress)], ErrorType.Validation);

    public Error NoAddressTypesProvided =>
            new("AddressType.NoAddressTypesProvided", _localizer[nameof(NoAddressTypesProvided)], ErrorType.Validation);

    public Error AddressTypesInOtherTables =>
            new("AddressType.AddressTypesInAddresses", _localizer[nameof(AddressTypesInOtherTables)], ErrorType.Validation);
}
