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

        RuleFor(a => a.NameEn)
            .Matches(RegexPattern.EnglishLettersAndSpaces)
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(a => a.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.NameAr)
            .Matches(RegexPattern.ArabicLettersAndSpaces)
            .WithMessage(_localizer[Strings.ArabicLetterOnly]);

        RuleFor(a => a)
           .MustAsync(IsAddressTypeNameEnUniqueAsync)
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(a => a)
           .MustAsync(IsAddressTypeNameArUniqueAsync)
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);
    }

    private async Task<bool> IsAddressTypeNameEnUniqueAsync(AddressTypeRequest addressType, CancellationToken cancellationToken) =>
        !await _dbContext.AddressTypes.AnyAsync(
            candidate => candidate.NameEn == addressType.NameEn && candidate.Id != addressType.Id,
            cancellationToken);

    private async Task<bool> IsAddressTypeNameArUniqueAsync(AddressTypeRequest addressType, CancellationToken cancellationToken) =>
        !await _dbContext.AddressTypes.AnyAsync(
            candidate => candidate.NameAr == addressType.NameAr && candidate.Id != addressType.Id,
            cancellationToken);
}
