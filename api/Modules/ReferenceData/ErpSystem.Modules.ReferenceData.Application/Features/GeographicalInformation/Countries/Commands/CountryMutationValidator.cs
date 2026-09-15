using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands;

public class CountryMutationValidator<TMutation> : AbstractValidator<TMutation>
    where TMutation : CountryMutation
{
    public CountryMutationValidator(
        IStringLocalizer<CreateCountryRequest> localizer)
    {
        RuleFor(country => country.NameEn)
            .GeographicalName(localizer, ValidationMessageKeys.NameEn);

        RuleFor(country => country.NameAr)
            .GeographicalName(localizer, ValidationMessageKeys.NameAr);

        RuleFor(country => country.Alpha2Code)
            .Length(2)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha2Code))
            .Matches(ValidationPatterns.IsoAlpha2Code)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha2Code));

        RuleFor(country => country.Alpha3Code)
            .Length(3)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha3Code))
            .Matches(ValidationPatterns.IsoAlpha3Code)
            .When(country => !string.IsNullOrWhiteSpace(country.Alpha3Code));

        RuleFor(country => country.PhoneCode)
            .Length(1, 10)
            .When(country => !string.IsNullOrWhiteSpace(country.PhoneCode))
            .Matches(ValidationPatterns.InternationalPhoneCode)
            .When(country => !string.IsNullOrWhiteSpace(country.PhoneCode));

        RuleFor(country => country.CurrencyCode)
            .Length(3)
            .When(country => !string.IsNullOrWhiteSpace(country.CurrencyCode))
            .Matches(ValidationPatterns.CurrencyCode)
            .When(country => !string.IsNullOrWhiteSpace(country.CurrencyCode));
    }
}
