using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;

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
            .WithName(Strings.Country)
            .WithMessage(_localizer[Strings.Required])
            .MustAsync(BeValidCountryAsync)
            .WithMessage(_localizer[Strings.InvalidCountry]);

        RuleFor(a => a.StateId)
            .Must(stateId => !stateId.HasValue || stateId.Value > 0)
            .WithName(Strings.State)
            .WithMessage(_localizer[Strings.InvalidState])
            .MustAsync(BelongsToCountryAsync)
            .WithMessage(_localizer[Strings.InvalidState]);

        RuleFor(a => a.DistrictId)
            .Must(districtId => !districtId.HasValue || districtId.Value > 0)
            .WithName(Strings.District)
            .WithMessage(_localizer[Strings.InvalidDistrict])
            .MustAsync(BelongsToStateAndCountryAsync)
            .WithMessage(_localizer[Strings.InvalidDistrict]);

        RuleFor(a => a.City)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.City)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(150)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.StreetLine1)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.StreetLine1)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(250)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.StreetLine2)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.StreetLine2)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(250)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.BuildingNumber)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.BuildingNumber)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(50)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.Floor)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.Floor)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(10)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.ApartmentNumber)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.ApartmentNumber)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(20)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.PostalCode)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.PostalCode)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(20)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.AdditionalInfo)
            .Must(PrintableTextRules.IsPrintable)
            .WithName(Strings.AdditionalInfo)
            .WithMessage(_localizer[Strings.InvalidValues])
            .MaximumLength(500)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a)
            .Must(a => a.Latitude.HasValue == a.Longitude.HasValue)
            .WithMessage(_localizer[Strings.InvalidCoordinates]);

        RuleFor(a => a.Latitude)
            .InclusiveBetween(-90, 90)
            .When(a => a.Latitude.HasValue)
            .WithName(Strings.Latitude)
            .WithMessage(_localizer[Strings.InvalidLatitude]);

        RuleFor(a => a.Longitude)
            .InclusiveBetween(-180, 180)
            .When(a => a.Longitude.HasValue)
            .WithName(Strings.Longitude)
            .WithMessage(_localizer[Strings.InvalidLongitude]);

        RuleFor(a => a.AddressTypeId)
            .GreaterThan(0)
            .WithName(Strings.AddressType)
            .WithMessage(_localizer[Strings.Required])
            .MustAsync(BeValidAddressTypeAsync)
            .WithMessage(_localizer[Strings.InvalidAddressType]);
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
