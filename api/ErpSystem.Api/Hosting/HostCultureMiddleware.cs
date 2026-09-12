using System.Globalization;
using Microsoft.AspNetCore.Localization;

namespace ErpSystem.Api.Hosting;

/// <summary>
/// Host-level request culture bridge preserving the legacy Culture header.
/// Editable localization resources remain module-owned.
/// </summary>
public sealed class HostCultureMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var header = context.Request.Headers["Culture"].FirstOrDefault();
        var language = string.IsNullOrWhiteSpace(header) || header.Length < 2
            ? null
            : header[..2];

        if (!string.IsNullOrWhiteSpace(language))
        {
            var culture = string.Equals(language, "ar", StringComparison.OrdinalIgnoreCase)
                ? "ar-EG"
                : "en-US";
            var requestCulture = new RequestCulture(culture, culture);
            context.Features.Set<IRequestCultureFeature>(new RequestCultureFeature(requestCulture, null));
            CultureInfo.CurrentCulture = new CultureInfo(culture);
            CultureInfo.CurrentUICulture = new CultureInfo(culture);
        }

        await next(context);
    }
}
