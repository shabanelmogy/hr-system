using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Errors;

public class AddressErrors(IStringLocalizer<AddressRequest> localizer)
{
    private readonly IStringLocalizer<AddressRequest> _localizer = localizer;

    public Error AddressExists =>
            new("Address.Duplicated", _localizer[nameof(AddressExists)], ErrorType.Conflict);

    public Error AddressNotFound =>
            new("Address.AddressNotFound", _localizer[nameof(AddressNotFound)], ErrorType.NotFound);

    public Error AddressTypeNotFound =>
            new("Address.InvalidAddressType", _localizer[Strings.InvalidAddressType], ErrorType.Validation);

    public Error InvalidCountry =>
            new("Address.InvalidCountry", _localizer[Strings.InvalidCountry], ErrorType.Validation);

    public Error InvalidState =>
            new("Address.InvalidState", _localizer[Strings.InvalidState], ErrorType.Validation);

    public Error InvalidDistrict =>
            new("Address.InvalidDistrict", _localizer[Strings.InvalidDistrict], ErrorType.Validation);

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

}
