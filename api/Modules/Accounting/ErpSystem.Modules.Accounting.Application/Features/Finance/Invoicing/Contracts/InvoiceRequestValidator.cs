namespace ErpSystem.Modules.Accounting.Application.Features.Finance.Invoicing.Contracts;

public sealed class InvoiceRequestValidator : AbstractValidator<InvoiceRequest>
{
    public InvoiceRequestValidator(IStringLocalizer<InvoiceRequest> localizer)
    {
        RuleFor(request => request.SellerName)
            .Trimmed()
            .NotEmpty()
            .WithMessage(localizer[ValidationMessageKeys.Required])
            .Must(value => Encoding.UTF8.GetByteCount(value) <= byte.MaxValue)
            .WithMessage(localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(request => request.VatRegistrationNumber)
            .NotEmpty()
            .WithMessage(localizer[ValidationMessageKeys.Required])
            .Matches("^[0-9]{15}$")
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.InvoiceTimestamp)
            .NotEmpty()
            .WithMessage(localizer[ValidationMessageKeys.Required])
            .Must(value => DateTimeOffset.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.RoundtripKind,
                out _))
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.InvoiceTotal)
            .GreaterThan(0)
            .WithMessage(localizer[ValidationMessageKeys.GreaterThanZero]);

        RuleFor(request => request.VatTotal)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(request => request.InvoiceTotal)
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);
    }
}
