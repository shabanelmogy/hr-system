using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;

public class CountryMutationValidator<TMutation> : AbstractValidator<TMutation>
    where TMutation : CountryMutation
{
    public CountryMutationValidator(
        IStringLocalizer<CreateCountryRequest> localizer)
    {
        RuleFor(country => country.NameEn)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.EnglishLettersAndSpaces)
            .WithMessage(localizer[Strings.EnglishLetterOnly]);

        RuleFor(country => country.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.ArabicLettersAndSpaces)
            .WithMessage(localizer[Strings.ArabicLetterOnly]);

        RuleFor(country => country.Alpha2Code)
            .Length(2)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha2Code))
            .Matches(RegexPattern.IsoAlpha2Code)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha2Code));

        RuleFor(country => country.Alpha3Code)
            .Length(3)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha3Code))
            .Matches(RegexPattern.IsoAlpha3Code)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha3Code));

        RuleFor(country => country.PhoneCode)
            .Length(1, 10)
            .When(country => !string.IsNullOrWhiteSpace(country.PhoneCode))
            .Matches(RegexPattern.InternationalPhoneCode)
            .When(country => !string.IsNullOrWhiteSpace(country.PhoneCode));

        RuleFor(country => country.CurrencyCode)
            .Length(3)
            .When(country => !string.IsNullOrWhiteSpace(country.CurrencyCode))
            .Matches(RegexPattern.CurrencyCode)
            .When(country => !string.IsNullOrWhiteSpace(country.CurrencyCode));
    }
}
