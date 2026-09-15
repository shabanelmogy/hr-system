using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Contracts;

public class StateRequestValidator : AbstractValidator<StateRequest>
{
    private readonly IStateValidationQueries _stateQueries;
    private readonly ICountryValidationQueries _countryQueries;
    private readonly IStringLocalizer<StateRequest> _localizer;

    public StateRequestValidator(
        IStateValidationQueries stateQueries,
        ICountryValidationQueries countryQueries,
        IStringLocalizer<StateRequest> localizer)
    {
        _stateQueries = stateQueries;
        _countryQueries = countryQueries;
        _localizer = localizer;

        RuleFor(s => s.NameEn)
            .GeographicalName(_localizer, ValidationMessageKeys.NameEn);

        RuleFor(s => s.NameAr)
            .GeographicalName(_localizer, ValidationMessageKeys.NameAr);

        RuleFor(s => s.Code)
            .Trimmed()
            .NotEmpty()
            .WithName(ValidationMessageKeys.Code)
            .WithMessage(_localizer[ValidationMessageKeys.Required])
            .Length(2, 10)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
            .Matches(ValidationPatterns.StateCode)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(s => s.CountryId)
            .GreaterThan(0)
            .WithName(ValidationMessageKeys.Country)
            .WithMessage(_localizer[ValidationMessageKeys.Required]);

        RuleFor(s => s)
           .MustAsync(IsStateNameEnUniqueAsync)
           .WithName(ValidationMessageKeys.NameEn)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(s => s)
           .MustAsync(IsStateNameArUniqueAsync)
           .WithName(ValidationMessageKeys.NameAr)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(s => s)
           .MustAsync(IsCodeUniqueAsync)
           .WithName(ValidationMessageKeys.Code)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(s => s)
           .MustAsync(IsCountryExistsAsync)
           .WithName(ValidationMessageKeys.Country)
           .WithMessage(_localizer[ValidationMessageKeys.CountryNotFound]);
    }

    private async Task<bool> IsStateNameEnUniqueAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(state.NameEn) || state.CountryId <= 0)
            return true;

        var nameEn = GeographicalNameRules.Normalize(state.NameEn);
        var stateId = state.Id;

        return !await _stateQueries.StateNameEnExistsAsync(
            nameEn,
            state.CountryId,
            stateId,
            cancellationToken);
    }

    private async Task<bool> IsStateNameArUniqueAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(state.NameAr) || state.CountryId <= 0)
            return true;

        var nameAr = GeographicalNameRules.Normalize(state.NameAr);
        var stateId = state.Id;

        return !await _stateQueries.StateNameArExistsAsync(
            nameAr,
            state.CountryId,
            stateId,
            cancellationToken);
    }

    private async Task<bool> IsCodeUniqueAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(state.Code) || state.CountryId <= 0)
            return true;

        var code = state.Code.Trim().ToUpperInvariant();
        var stateId = state.Id;

        return !await _stateQueries.StateCodeExistsAsync(
            code,
            state.CountryId,
            stateId,
            cancellationToken);
    }

    private async Task<bool> IsCountryExistsAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (state.CountryId <= 0)
            return true;

        return await _countryQueries.CountryExistsAsync(state.CountryId, cancellationToken);
    }
}
