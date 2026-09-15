using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Contracts;

public class AddressTypeRequestValidator : AbstractValidator<AddressTypeRequest>
{
    private readonly IAddressTypeValidationQueries _queries;
    private readonly IStringLocalizer<AddressTypeRequest> _localizer;

    public AddressTypeRequestValidator(IAddressTypeValidationQueries queries, IStringLocalizer<AddressTypeRequest> localizer)
    {
        _queries = queries;
        _localizer = localizer;

        RuleFor(a => a.NameEn)
            .GeographicalName(_localizer, ValidationMessageKeys.NameEn);

        RuleFor(a => a.NameAr)
            .GeographicalName(_localizer, ValidationMessageKeys.NameAr);

        RuleFor(a => a)
           .MustAsync(IsAddressTypeNameEnUniqueAsync)
           .WithName(ValidationMessageKeys.NameEn)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);

        RuleFor(a => a)
           .MustAsync(IsAddressTypeNameArUniqueAsync)
           .WithName(ValidationMessageKeys.NameAr)
           .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue]);
    }

    private async Task<bool> IsAddressTypeNameEnUniqueAsync(AddressTypeRequest addressType, CancellationToken cancellationToken) =>
        !await _queries.AddressTypeNameEnExistsAsync(
            GeographicalNameRules.Normalize(addressType.NameEn),
            addressType.Id,
            cancellationToken);

    private async Task<bool> IsAddressTypeNameArUniqueAsync(AddressTypeRequest addressType, CancellationToken cancellationToken) =>
        !await _queries.AddressTypeNameArExistsAsync(
            GeographicalNameRules.Normalize(addressType.NameAr),
            addressType.Id,
            cancellationToken);
}
