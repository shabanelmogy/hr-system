namespace HrManagementSystem.Infrastructure.Common.Observability;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = CorrelationContext.Resolve(context);
        context.Items[CorrelationContext.ItemKey] = correlationId;
        context.Response.Headers[CorrelationContext.HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}
