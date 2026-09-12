using Serilog.Context;

namespace ErpSystem.Api.Hosting;

public sealed class HostCorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = HostCorrelationContext.Resolve(context);
        context.Items[HostCorrelationContext.ItemKey] = correlationId;
        context.Response.Headers[HostCorrelationContext.HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
            await next(context);
    }
}
