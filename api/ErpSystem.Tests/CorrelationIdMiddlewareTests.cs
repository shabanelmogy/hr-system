using ErpSystem.Api.Hosting;
using Microsoft.AspNetCore.Http;

namespace ErpSystem.Tests;

public sealed class CorrelationIdMiddlewareTests
{
    [Fact]
    public async Task Middleware_PreservesValidClientCorrelationId()
    {
        const string correlationId = "client-request-123";
        var context = new DefaultHttpContext();
        context.Request.Headers[HostCorrelationContext.HeaderName] = correlationId;
        var middleware = new HostCorrelationIdMiddleware(nextContext =>
        {
            Assert.Equal(correlationId, nextContext.GetCorrelationId());
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(context);

        Assert.Equal(correlationId, context.Response.Headers[HostCorrelationContext.HeaderName]);
    }

    [Fact]
    public async Task Middleware_ReplacesUnsafeClientCorrelationId()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers[HostCorrelationContext.HeaderName] = "unsafe header value";
        var middleware = new HostCorrelationIdMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context);

        var correlationId = context.GetCorrelationId();
        Assert.NotEqual("unsafe header value", correlationId);
        Assert.NotEmpty(correlationId);
        Assert.Equal(correlationId, context.Response.Headers[HostCorrelationContext.HeaderName]);
    }
}
