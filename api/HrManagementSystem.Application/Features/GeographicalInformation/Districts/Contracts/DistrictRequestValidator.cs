namespace HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;

public class DistrictRequestValidator : AbstractValidator<DistrictRequest>
{
    private readonly IDistrictValidationQueries _districtQueries;
    private readonly IStateValidationQueries _stateQueries;
    private readonly IStringLocalizer<DistrictRequest> _localizer;

    public DistrictRequestValidator(
        IDistrictValidationQueries districtQueries,
        IStateValidationQueries stateQueries,
        IStringLocalizer<DistrictRequest> localizer)
    {
        _districtQueries = districtQueries;
        _stateQueries = stateQueries;
        _localizer = localizer;

        RuleFor(d => d.NameEn)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(d => d.NameEn)
            .Matches(RegexPattern.EnglishLettersAndSpaces)
            .WithMessage(_localizer[Strings.EnglishLetterOnly]);

        RuleFor(d => d.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(d => d.NameAr)
            .Matches(RegexPattern.ArabicLettersAndSpaces)
            .WithMessage(_localizer[Strings.ArabicLetterOnly]);

        RuleFor(d => d.Code)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.Code)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 10)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(d => d.StateId)
            .GreaterThan(0)
            .WithName(Strings.State)
            .WithMessage(_localizer[Strings.Required]);

        RuleFor(d => d)
           .MustAsync(IsDistrictNameEnUniqueAsync)
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsDistrictNameArUniqueAsync)
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsCodeUniqueAsync)
           .WithName(Strings.Code)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsStateValidAsync)
           .WithName(Strings.State)
           .WithMessage(_localizer[Strings.StateNotFound]);
    }

    private async Task<bool> IsDistrictNameEnUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _districtQueries.DistrictNameEnExistsAsync(
            district.NameEn,
            district.StateId,
            district.Id,
            cancellationToken);

    private async Task<bool> IsDistrictNameArUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _districtQueries.DistrictNameArExistsAsync(
            district.NameAr,
            district.StateId,
            district.Id,
            cancellationToken);

    private async Task<bool> IsCodeUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _districtQueries.DistrictCodeExistsAsync(
            district.Code,
            district.StateId,
            district.Id,
            cancellationToken);

    private Task<bool> IsStateValidAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        _stateQueries.StateExistsAsync(district.StateId, cancellationToken);
}
