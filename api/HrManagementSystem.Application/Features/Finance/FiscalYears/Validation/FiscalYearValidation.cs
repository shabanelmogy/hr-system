using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Validation;

public static class FiscalYearValidation
{
    public static bool IsValidRowVersion(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        Span<byte> buffer = stackalloc byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out var bytesWritten) && bytesWritten > 0;
    }

    public static bool HasPrintableText(string value) =>
        !string.IsNullOrWhiteSpace(value) && value.All(character => !char.IsControl(character));
}

public class FiscalYearMutationValidator<TMutation> : AbstractValidator<TMutation>
    where TMutation : FiscalYearMutation
{
    public FiscalYearMutationValidator(IStringLocalizer<CreateFiscalYearRequest> localizer)
    {
        RuleFor(request => request.Code)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer["FiscalYearCodeRequired"])
            .Length(2, 20).WithMessage(localizer["FiscalYearCodeInvalid"])
            .Matches("^[A-Za-z0-9][A-Za-z0-9._/-]{1,19}$").WithMessage(localizer["FiscalYearCodeInvalid"]);
        RuleFor(request => request.NameAr)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer["FiscalYearNameRequired"])
            .MaximumLength(100).WithMessage(localizer["FiscalYearNameInvalid"])
            .Must(FiscalYearValidation.HasPrintableText).WithMessage(localizer["FiscalYearNameInvalid"]);
        RuleFor(request => request.NameEn)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer["FiscalYearNameRequired"])
            .MaximumLength(100).WithMessage(localizer["FiscalYearNameInvalid"])
            .Must(FiscalYearValidation.HasPrintableText).WithMessage(localizer["FiscalYearNameInvalid"]);
        RuleFor(request => request.EndDate)
            .Must((request, endDate) => endDate == request.StartDate.AddYears(1).AddDays(-1))
            .WithMessage(localizer["FiscalYearDurationInvalid"]);
        RuleFor(request => request.PeriodFrequency)
            .IsInEnum().WithMessage(localizer["FiscalYearFrequencyInvalid"]);
    }
}
