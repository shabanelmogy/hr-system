namespace HrManagementSystem.Application.Features.GeographicalInformation.Validation;

public static class GeographicalNameRules
{
    public const int MinimumLength = 2;
    public const int MaximumLength = 100;

    /// <summary>
    /// Returns the canonical representation persisted for a geographic name.
    /// Trimming and NFC normalization keep visually identical Unicode values
    /// consistent before they are compared or stored.
    /// </summary>
    public static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var trimmed = value.Trim();
        try
        {
            return trimmed.Normalize(NormalizationForm.FormC);
        }
        catch (ArgumentException)
        {
            // Keep malformed UTF-16 available for the printable-text rule to reject
            // instead of allowing normalization to turn user input into a 500.
            return trimmed;
        }
    }

    public static bool IsValid(string? value)
    {
        var normalized = Normalize(value);
        if (normalized.Length == 0)
            return false;

        return PrintableTextRules.IsPrintable(normalized);
    }

    public static IRuleBuilderOptions<T, string> GeographicalName<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        IStringLocalizer localizer,
        string propertyName)
    {
        return ruleBuilder
            .Canonicalized()
            .NotEmpty()
            .WithName(propertyName)
            .WithMessage(localizer[Strings.Required])
            .Length(MinimumLength, MaximumLength)
            .WithMessage(localizer[Strings.MaxLengthError])
            .Must(IsValid)
            .WithMessage(localizer[Strings.InvalidValues]);
    }

    private static IRuleBuilderOptions<T, string> Canonicalized<T>(
        this IRuleBuilder<T, string> ruleBuilder)
    {
        return (IRuleBuilderOptions<T, string>)ruleBuilder.Custom((value, context) =>
        {
            if (value is null || context.PropertyPath is null)
                return;

            var property = typeof(T).GetProperty(context.PropertyPath);
            if (property is not null && property.CanWrite)
                property.SetValue(context.InstanceToValidate, Normalize(value));
        });
    }
}
