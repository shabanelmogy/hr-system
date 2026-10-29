using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Presentation.Authentication;

public sealed class BrowserAuthenticationMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IOptions<BrowserAuthenticationOptions> options, BrowserAntiforgery antiforgery)
    {
        if (HttpMethods.IsOptions(context.Request.Method)) { await next(context); return; }
        var browserEndpoint = context.GetEndpoint()?.Metadata.GetMetadata<BrowserAuthenticationEndpointAttribute>() is not null;
        var cookieActor = context.User.Identity?.IsAuthenticated == true &&
            context.Items.ContainsKey(BrowserAuthenticationDefaults.CookieAuthenticationItem);
        var mutation = !HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method);
        if (browserEndpoint) context.Response.Headers.CacheControl = "no-store, private";
        if (browserEndpoint && context.Request.Headers.ContainsKey("Authorization"))
        {
            await Reject(context, 401, "Authentication.AmbiguousBrowserIdentity"); return;
        }
        if (browserEndpoint || (cookieActor && mutation))
        {
            var origin = context.Request.Headers.Origin.ToString();
            if (!context.Request.IsHttps || !options.Value.AllowedOrigins.Contains(origin, StringComparer.Ordinal))
            {
                await Reject(context, 403, "Authentication.BrowserOriginDenied"); return;
            }
            if (mutation)
            {
                try { await antiforgery.ValidateAsync(context); }
                catch (AntiforgeryValidationException)
                {
                    await Reject(context, 400, "Authentication.AntiforgeryValidationFailed"); return;
                }
            }
        }
        await next(context);
    }

    private static Task Reject(HttpContext context, int status, string code)
    {
        context.Response.StatusCode = status;
        context.Response.Headers.CacheControl = "no-store, private";
        return context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status, Title = code, Type = $"urn:erp:error:{code}"
        }, options: null, contentType: "application/problem+json", cancellationToken: context.RequestAborted);
    }
}
