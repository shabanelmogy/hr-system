namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;

public class AddressTypeRequestValidator : AbstractValidator<AddressTypeRequest>
{
    private readonly IAddressTypeValidationQueries _queries;
    private readonly IStringLocalizer<AddressTypeRequest> _localizer;

    public AddressTypeRequestValidator(IAddressTypeValidationQueries queries, IStringLocalizer<AddressTypeRequest> localizer)
    {
        _queries = queries;
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
        !await _queries.AddressTypeNameEnExistsAsync(
            addressType.NameEn,
            addressType.Id,
            cancellationToken);

    private async Task<bool> IsAddressTypeNameArUniqueAsync(AddressTypeRequest addressType, CancellationToken cancellationToken) =>
        !await _queries.AddressTypeNameArExistsAsync(
            addressType.NameAr,
            addressType.Id,
            cancellationToken);
}
