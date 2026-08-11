using System.Diagnostics;

namespace HrManagementSystem.Infrastructure.Common.Observability;

public static class CorrelationContext
{
    public const string HeaderName = "X-Correlation-ID";
    public const string ItemKey = "HrManagementSystem.CorrelationId";

    public static string GetCorrelationId(this HttpContext context) =>
        context.Items.TryGetValue(ItemKey, out var value) && value is string correlationId
            ? correlationId
            : context.TraceIdentifier;

    internal static string Resolve(HttpContext context)
    {
        var supplied = context.Request.Headers[HeaderName].FirstOrDefault();
        if (IsValid(supplied))
            return supplied!;

        return Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");
    }

    private static bool IsValid(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= 128 &&
        value.All(character =>
            char.IsAsciiLetterOrDigit(character) || character is '-' or '_' or '.');
}
