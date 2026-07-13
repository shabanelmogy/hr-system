namespace HrManagementSystem.Features.GeographicalInformation.States.Contracts;

public class StateRequestValidator : AbstractValidator<StateRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<StateRequest> _localizer;

    public StateRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<StateRequest> localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;

        RuleFor(s => s.NameEn)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.EnglishLettersAndSpaces)
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(s => s.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError])
            .Matches(RegexPattern.ArabicLettersAndSpaces)
            .WithMessage(_localizer[Strings.ArabicLetterOnly]);

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

        var nameEn = state.NameEn.Trim();
        var stateId = state.Id;

        return !await _dbContext.States.AnyAsync(
            s => s.NameEn == nameEn &&
                 s.CountryId == state.CountryId &&
                 (!stateId.HasValue || s.Id != stateId.Value),
            cancellationToken);
    }

    private async Task<bool> IsStateNameArUniqueAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(state.NameAr) || state.CountryId <= 0)
            return true;

        var nameAr = state.NameAr.Trim();
        var stateId = state.Id;

        return !await _dbContext.States.AnyAsync(
            s => s.NameAr == nameAr &&
                 s.CountryId == state.CountryId &&
                 (!stateId.HasValue || s.Id != stateId.Value),
            cancellationToken);
    }

    private async Task<bool> IsCodeUniqueAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(state.Code) || state.CountryId <= 0)
            return true;

        var code = state.Code.Trim().ToUpperInvariant();
        var stateId = state.Id;

        return !await _dbContext.States.AnyAsync(
            s => s.Code == code &&
                 s.CountryId == state.CountryId &&
                 (!stateId.HasValue || s.Id != stateId.Value),
            cancellationToken);
    }

    private async Task<bool> IsCountryExistsAsync(StateRequest state, CancellationToken cancellationToken)
    {
        if (state.CountryId <= 0)
            return true;

        return await _dbContext.Countries.AnyAsync(
            c => c.Id == state.CountryId && !c.IsDeleted,
            cancellationToken);
    }
}
