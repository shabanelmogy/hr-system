using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;

public class AddressRequestValidator : AbstractValidator<AddressRequest>
{
    private readonly IAddressTypeValidationQueries _addressTypeQueries;
    private readonly ICountryValidationQueries _countryQueries;
    private readonly IStateValidationQueries _stateQueries;
    private readonly IDistrictValidationQueries _districtQueries;
    private readonly IStringLocalizer<AddressRequest> _localizer;

    public AddressRequestValidator(
        IAddressTypeValidationQueries addressTypeQueries,
        ICountryValidationQueries countryQueries,
        IStateValidationQueries stateQueries,
        IDistrictValidationQueries districtQueries,
        IStringLocalizer<AddressRequest> localizer)
    {
        _addressTypeQueries = addressTypeQueries;
        _countryQueries = countryQueries;
        _stateQueries = stateQueries;
        _districtQueries = districtQueries;
        _localizer = localizer;

        RuleFor(a => a.CountryId)
            .GreaterThan(0)
            .WithName(ValidationMessageKeys.Country)
            .WithMessage(_localizer[ValidationMessageKeys.Required])
            .MustAsync(BeValidCountryAsync)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidCountry]);

        RuleFor(a => a.StateId)
            .Must(stateId => !stateId.HasValue || stateId.Value > 0)
            .WithName(ValidationMessageKeys.State)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidState])
            .MustAsync(BelongsToCountryAsync)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidState]);

        RuleFor(a => a.DistrictId)
            .Must(districtId => !districtId.HasValue || districtId.Value > 0)
            .WithName(ValidationMessageKeys.District)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidDistrict])
            .MustAsync(BelongsToStateAndCountryAsync)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidDistrict]);

        RuleFor(a => a.City)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.City)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(150)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.StreetLine1)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.StreetLine1)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(250)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.StreetLine2)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.StreetLine2)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(250)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.BuildingNumber)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.BuildingNumber)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(50)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.Floor)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.Floor)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(10)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.ApartmentNumber)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.ApartmentNumber)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(20)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.PostalCode)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.PostalCode)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(20)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a.AdditionalInfo)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(ValidationMessageKeys.AdditionalInfo)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
            .MaximumLength(500)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(a => a)
            .Must(a => a.Latitude.HasValue == a.Longitude.HasValue)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidCoordinates]);

        RuleFor(a => a.Latitude)
            .InclusiveBetween(-90, 90)
            .When(a => a.Latitude.HasValue)
            .WithName(ValidationMessageKeys.Latitude)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidLatitude]);

        RuleFor(a => a.Longitude)
            .InclusiveBetween(-180, 180)
            .When(a => a.Longitude.HasValue)
            .WithName(ValidationMessageKeys.Longitude)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidLongitude]);

        RuleFor(a => a.AddressTypeId)
            .GreaterThan(0)
            .WithName(ValidationMessageKeys.AddressType)
            .WithMessage(_localizer[ValidationMessageKeys.Required])
            .MustAsync(BeValidAddressTypeAsync)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidAddressType]);
    }

    private Task<bool> BeValidCountryAsync(int countryId, CancellationToken cancellationToken) =>
        _countryQueries.CountryExistsAsync(countryId, cancellationToken);

    private Task<bool> BeValidAddressTypeAsync(int addressTypeId, CancellationToken cancellationToken) =>
        _addressTypeQueries.AddressTypeExistsAsync(addressTypeId, cancellationToken);

    private async Task<bool> BelongsToCountryAsync(
        AddressRequest request,
        int? stateId,
        CancellationToken cancellationToken)
    {
        if (!stateId.HasValue)
            return true;

        var countryId = await _stateQueries.GetCountryIdAsync(stateId.Value, cancellationToken);
        return countryId == request.CountryId;
    }

    private async Task<bool> BelongsToStateAndCountryAsync(
        AddressRequest request,
        int? districtId,
        CancellationToken cancellationToken)
    {
        if (!districtId.HasValue)
            return true;

        var stateId = await _districtQueries.GetStateIdAsync(districtId.Value, cancellationToken);
        if (!stateId.HasValue || request.StateId != stateId.Value)
            return false;

        var countryId = await _stateQueries.GetCountryIdAsync(stateId.Value, cancellationToken);
        return countryId == request.CountryId;
    }
}
