namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;

public class AddressTypeRequestValidator : AbstractValidator<AddressTypeRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<AddressTypeRequest> _localizer;

    public AddressTypeRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<AddressTypeRequest> localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;

        RuleFor(a => a.NameEn)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a)
           .Must(a => !IsAddressTypeNameEnDuplicated(a))
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(a => a)
           .Must(a => !IsAddressTypeNameArDuplicated(a))
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);
    }

    private bool IsAddressTypeNameEnDuplicated(AddressTypeRequest addressType)
    {
        return _dbContext.AddressTypes.Any(a => a.NameEn == addressType.NameEn && a.Id != addressType.Id);
    }

    private bool IsAddressTypeNameArDuplicated(AddressTypeRequest addressType)
    {
        return _dbContext.AddressTypes.Any(a => a.NameAr == addressType.NameAr && a.Id != addressType.Id);
    }
}