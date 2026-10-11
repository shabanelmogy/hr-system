using System.Diagnostics;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Presentation.Common.Observability;

namespace ErpSystem.Api.Hosting;

/// <summary>
/// Resolves the request correlation id at the host edge. The value is stored under the
/// single shared key read by <see cref="CorrelationContextExtensions.GetCorrelationId"/>,
/// which every module and the host use (there used to be three copies with two keys).
/// </summary>
public static class HostCorrelationContext
{
    public const string HeaderName = ExecutionContextHeaderNames.CorrelationId;

    public const string ItemKey = CorrelationContextExtensions.ItemKey;

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
