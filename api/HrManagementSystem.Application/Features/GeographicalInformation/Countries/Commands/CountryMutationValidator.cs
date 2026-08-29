using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;

public class CountryMutationValidator<TMutation> : AbstractValidator<TMutation>
    where TMutation : CountryMutation
{
    public CountryMutationValidator(
        IStringLocalizer<CreateCountryRequest> localizer)
    {
        RuleFor(country => country.NameEn)
            .GeographicalName(localizer, Strings.NameEn);

        RuleFor(country => country.NameAr)
            .GeographicalName(localizer, Strings.NameAr);

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
