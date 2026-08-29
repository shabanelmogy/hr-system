namespace HrManagementSystem.Application.Features.GeographicalInformation.Validation;

public static class GeographicalNameRules
{
    public const int MinimumLength = 2;
    public const int MaximumLength = 100;

    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        return PrintableTextRules.IsPrintable(value);
    }

    public static IRuleBuilderOptions<T, string> GeographicalName<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        IStringLocalizer localizer,
        string propertyName)
    {
        return ruleBuilder
            .Trimmed()
            .NotEmpty()
            .WithName(propertyName)
            .WithMessage(localizer[Strings.Required])
            .Length(MinimumLength, MaximumLength)
            .WithMessage(localizer[Strings.MaxLengthError])
            .Must(IsValid)
            .WithMessage(localizer[Strings.InvalidValues]);
    }
}
