namespace HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;

public class CountryRequestValidator : AbstractValidator<CountryRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<CountryRequest> _localizer;

    public CountryRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<CountryRequest> localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;

        RuleFor(c => c.NameEn)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.EnglishLettersAndSpaces)
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(c => c.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.ArabicLettersAndSpaces)
            .WithMessage(_localizer[Strings.ArabicLetterOnly]);

        RuleFor(c => c.Alpha2Code)
            .Length(2, 2)
            .When(c => !string.IsNullOrWhiteSpace(c.Alpha2Code))
            .Trimmed()
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.IsoAlpha2Code)
            .When(c => !string.IsNullOrWhiteSpace(c.Alpha2Code))
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(c => c.Alpha3Code)
            .Length(3, 3)
            .When(c => !string.IsNullOrWhiteSpace(c.Alpha3Code))
            .Trimmed()
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.IsoAlpha3Code)
            .When(c => !string.IsNullOrWhiteSpace(c.Alpha3Code))
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(c => c.PhoneCode)
            .Length(1, 10)
            .When(c => !string.IsNullOrWhiteSpace(c.PhoneCode))
            .Trimmed()
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.InternationalPhoneCode)
            .When(c => !string.IsNullOrWhiteSpace(c.PhoneCode))
            .WithMessage(_localizer[Strings.InvalidValues]);

        RuleFor(c => c.CurrencyCode)
            .Length(3)
            .When(c => !string.IsNullOrWhiteSpace(c.CurrencyCode))
            .Trimmed()
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.CurrencyCode)
            .When(c => !string.IsNullOrWhiteSpace(c.CurrencyCode))
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(c => c)
           .MustAsync(IsCountryNameEnUniqueAsync)
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(c => c)
           .MustAsync(IsCountryNameArUniqueAsync)
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(c => c)
           .MustAsync(IsAlpha2CodeUniqueAsync)
           .WithName(Strings.Alpha2Code)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(c => c)
           .MustAsync(IsAlpha3CodeUniqueAsync)
           .WithName(Strings.Alpha3Code)
           .WithMessage(_localizer[Strings.DuplicatedValue]);
    }

    private async Task<bool> IsCountryNameEnUniqueAsync(CountryRequest country, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(country.NameEn))
            return true;

        var nameEn = country.NameEn.Trim();
        var countryId = country.Id;

        return !await _dbContext.Countries.AnyAsync(
            c => c.NameEn == nameEn && (!countryId.HasValue || c.Id != countryId.Value),
            cancellationToken);
    }

    private async Task<bool> IsCountryNameArUniqueAsync(CountryRequest country, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(country.NameAr))
            return true;

        var nameAr = country.NameAr.Trim();
        var countryId = country.Id;

        return !await _dbContext.Countries.AnyAsync(
            c => c.NameAr == nameAr && (!countryId.HasValue || c.Id != countryId.Value),
            cancellationToken);
    }

    private async Task<bool> IsAlpha2CodeUniqueAsync(CountryRequest country, CancellationToken cancellationToken)
    {
        var alpha2Code = country.Alpha2Code?.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(alpha2Code))
            return true;

        var countryId = country.Id;

        return !await _dbContext.Countries.AnyAsync(
            c => c.Alpha2Code == alpha2Code && (!countryId.HasValue || c.Id != countryId.Value),
            cancellationToken);
    }

    private async Task<bool> IsAlpha3CodeUniqueAsync(CountryRequest country, CancellationToken cancellationToken)
    {
        var alpha3Code = country.Alpha3Code?.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(alpha3Code))
            return true;

        var countryId = country.Id;

        return !await _dbContext.Countries.AnyAsync(
            c => c.Alpha3Code == alpha3Code && (!countryId.HasValue || c.Id != countryId.Value),
            cancellationToken);
    }
}
