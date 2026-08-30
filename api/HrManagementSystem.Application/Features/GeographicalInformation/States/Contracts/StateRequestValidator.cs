using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

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
            .GeographicalName(_localizer, Strings.NameEn);

        RuleFor(s => s.NameAr)
            .GeographicalName(_localizer, Strings.NameAr);

        RuleFor(s => s.Code)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.Code)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 10)
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.StateCode)
            .WithMessage(_localizer[Strings.InvalidValues]);

        RuleFor(s => s.CountryId)
            .GreaterThan(0)
            .WithName(Strings.Country)
            .WithMessage(_localizer[Strings.Required]);

        RuleFor(s => s)
           .MustAsync(IsStateNameEnUniqueAsync)
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(s => s)
           .MustAsync(IsStateNameArUniqueAsync)
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(s => s)
           .MustAsync(IsCodeUniqueAsync)
           .WithName(Strings.Code)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(s => s)
           .MustAsync(IsCountryExistsAsync)
           .WithName(Strings.Country)
           .WithMessage(_localizer[Strings.CountryNotFound]);
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
