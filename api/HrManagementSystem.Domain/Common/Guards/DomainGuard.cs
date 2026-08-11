namespace HrManagementSystem.Domain.Common.Guards;

internal static class DomainGuard
{
    public static string Required(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }

    public static string? Optional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static int Positive(int value, string parameterName)
    {
        if (value <= 0)
            throw new ArgumentOutOfRangeException(parameterName, "The value must be positive.");

        return value;
    }

    public static int? PositiveOrNull(int? value, string parameterName) =>
        value.HasValue ? Positive(value.Value, parameterName) : null;

    public static TEnum Defined<TEnum>(TEnum value, string parameterName)
        where TEnum : struct, Enum
    {
        if (!Enum.IsDefined(value))
            throw new ArgumentOutOfRangeException(parameterName, "The enum value is not defined.");

        return value;
    }

    public static decimal NonNegative(decimal value, string parameterName)
    {
        if (value < 0)
            throw new ArgumentOutOfRangeException(parameterName, "The value cannot be negative.");

        return value;
    }

    public static decimal? NonNegativeOrNull(decimal? value, string parameterName) =>
        value.HasValue ? NonNegative(value.Value, parameterName) : null;

    public static string NormalizeCurrencyCode(string value, string parameterName)
    {
        var normalized = Required(value, parameterName).ToUpperInvariant();
        if (normalized.Length != 3)
            throw new ArgumentException("Currency codes must contain three characters.", parameterName);

        return normalized;
    }

    public static string? NormalizeCurrencyCodeOrNull(string? value, string parameterName) =>
        string.IsNullOrWhiteSpace(value) ? null : NormalizeCurrencyCode(value, parameterName);
}
