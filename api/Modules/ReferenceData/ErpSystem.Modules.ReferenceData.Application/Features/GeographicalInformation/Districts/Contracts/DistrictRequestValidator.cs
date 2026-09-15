using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Contracts;

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
            .GeographicalName(_localizer, ValidationMessageKeys.NameEn);

        RuleFor(d => d.NameAr)
            .GeographicalName(_localizer, ValidationMessageKeys.NameAr);

        RuleFor(d => d.Code)
            .Trimmed()
            .NotEmpty()
            .WithName(ValidationMessageKeys.Code)
            .WithMessage(_localizer[ValidationMessageKeys.Required])
            .Length(2, 10)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
            .Matches(ValidationPatterns.StateCode)
            .WithMessage(_localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(d => d.StateId)
            .GreaterThan(0)
            .WithName(ValidationMessageKeys.State)
            .WithMessage(_localizer[ValidationMessageKeys.Required]);

        RuleFor(d => d)
           .MustAsync(IsDistrictNameEnUniqueAsync)
           .WithName(ValidationMessageKeys.NameEn)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsDistrictNameArUniqueAsync)
           .WithName(ValidationMessageKeys.NameAr)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsCodeUniqueAsync)
           .WithName(ValidationMessageKeys.Code)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsStateValidAsync)
           .WithName(ValidationMessageKeys.State)
           .WithMessage(_localizer[ValidationMessageKeys.StateNotFound]);
    }

    private async Task<bool> IsDistrictNameEnUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _districtQueries.DistrictNameEnExistsAsync(
            GeographicalNameRules.Normalize(district.NameEn),
            district.StateId,
            district.Id,
            cancellationToken);

    private async Task<bool> IsDistrictNameArUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _districtQueries.DistrictNameArExistsAsync(
            GeographicalNameRules.Normalize(district.NameAr),
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
