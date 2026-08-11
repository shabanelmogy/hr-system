using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Errors;

public class AddressErrors(IStringLocalizer<AddressRequest> localizer)
{
    private readonly IStringLocalizer<AddressRequest> _localizer = localizer;

    public Error AddressExists =>
            new("Address.Duplicated", _localizer[nameof(AddressExists)], ErrorType.Conflict);

    public Error AddressNotFound =>
            new("Address.AddressNotFound", _localizer[nameof(AddressNotFound)], ErrorType.NotFound);

    public Error AddressError =>
            new("Address.AddressError", _localizer[nameof(AddressError)], ErrorType.Unexpected);

    public Error AddressInUseByOtherEntities =>
            new("Address.AddressInUseByOtherEntities", _localizer[nameof(AddressInUseByOtherEntities)], ErrorType.Validation);

    public Error NoAddressesProvided =>
            new("Address.NoAddressesProvided", _localizer[nameof(NoAddressesProvided)], ErrorType.Validation);

    public Error AddressesInOtherTables =>
            new("Address.AddressesInOtherTables", _localizer[nameof(AddressesInOtherTables)], ErrorType.Validation);

    public Error InvalidCoordinates =>
            new("Address.InvalidCoordinates", _localizer[nameof(InvalidCoordinates)], ErrorType.Validation);

    public Error DefaultAddressCannotBeDeleted =>
            new("Address.DefaultAddressCannotBeDeleted", _localizer[nameof(DefaultAddressCannotBeDeleted)], ErrorType.Validation);
}
