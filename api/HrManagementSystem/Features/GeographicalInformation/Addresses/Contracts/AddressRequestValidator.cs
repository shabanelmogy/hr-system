namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;

public class AddressRequestValidator : AbstractValidator<AddressRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<AddressRequest> _localizer;

    public AddressRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<AddressRequest> localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;

        RuleFor(a => a.BuildingNumber)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.BuildingNumber)
            .WithMessage(_localizer[Strings.Required])
            .MaximumLength(50)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.Floor)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.Floor)
            .WithMessage(_localizer[Strings.Required])
            .MaximumLength(10)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.ApartmentNumber)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.ApartmentNumber)
            .WithMessage(_localizer[Strings.Required])
            .MaximumLength(20)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.PostalCode)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.PostalCode)
            .WithMessage(_localizer[Strings.Required])
            .MaximumLength(20)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.AdditionalInfo)
            .Trimmed()
            .MaximumLength(500)
            .WithName(Strings.AdditionalInfo)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.Latitude)
            .InclusiveBetween(-90, 90)
            .WithName(Strings.Latitude)
            .WithMessage(_localizer[Strings.InvalidLatitude]);

        RuleFor(a => a.Longitude)
            .InclusiveBetween(-180, 180)
            .WithName(Strings.Longitude)
            .WithMessage(_localizer[Strings.InvalidLongitude]);

        RuleFor(a => a.AddressTypeId)
            .GreaterThan(0)
            .WithName(Strings.AddressType)
            .WithMessage(_localizer[Strings.Required])
            .Must(BeValidAddressType)
            .WithMessage(_localizer[Strings.InvalidAddressType]);

        RuleFor(a => a.DistrictId)
            .GreaterThan(0)
            .WithName(Strings.District)
            .WithMessage(_localizer[Strings.Required])
            .Must(BeValidDistrict)
            .WithMessage(_localizer[Strings.InvalidDistrict]);
    }

    private bool BeValidAddressType(int addressTypeId)
    {
        return _dbContext.AddressTypes.Any(at => at.Id == addressTypeId && !at.IsDeleted);
    }

    private bool BeValidDistrict(int districtId)
    {
        return _dbContext.Districts.Any(d => d.Id == districtId && !d.IsDeleted);
    }
}
