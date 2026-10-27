using System.Net;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text.Json;
using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.IntegrationTests;

public sealed class HostErrorLogMiddlewareTests
{
    [Fact]
    public async Task Captures_route_template_and_trace_but_no_query_or_actual_path_values()
    {
        var context = CreateContext();
        context.Request.Path = "/api/v1/orders/private-customer-id";
        context.Request.QueryString = new QueryString("?token=private-token");
        context.SetEndpoint(new Microsoft.AspNetCore.Routing.RouteEndpoint(_ => Task.CompletedTask,
            Microsoft.AspNetCore.Routing.Patterns.RoutePatternFactory.Parse("api/v1/orders/{id}"),
            0, new EndpointMetadataCollection(), "Orders"));
        var sink = new Sink();
        await new HostErrorLogMiddleware(ctx => { ctx.Response.StatusCode = 500; return Task.CompletedTask; }, TimeProvider.System)
            .InvokeAsync(context, sink);
        var text = string.Join("\n", Assert.Single(sink.Entries).MethodFrames!);
        Assert.Contains("RouteTemplate: api/v1/orders/{id}", text);
        Assert.Contains("HttpMethod:", text);
        Assert.Contains("RuntimeVersion:", text);
        Assert.Contains("RequestTrace:", text);
        Assert.DoesNotContain("private", text);
        Assert.DoesNotContain("token", text);
    }

    [Theory]
    [InlineData(400)]
    [InlineData(401)]
    [InlineData(403)]
    [InlineData(404)]
    [InlineData(409)]
    [InlineData(422)]
    [InlineData(429)]
    [InlineData(500)]
    [InlineData(503)]
    public async Task Final_failure_is_captured_once_with_safe_metadata(int status)
    {
        var context = CreateContext();
        var sink = new Sink();
        var middleware = new HostErrorLogMiddleware(ctx =>
        {
            ctx.Response.StatusCode = status;
            return Task.CompletedTask;
        }, TimeProvider.System);

        await middleware.InvokeAsync(context, sink);

        var capture = Assert.Single(sink.Entries);
        Assert.Equal(status, capture.StatusCode);
        Assert.Equal(status >= 500 ? ErrorLogSeverity.Error : ErrorLogSeverity.Warning, capture.Severity);
        Assert.Equal("tenant", capture.TenantId);
        Assert.Equal(7, capture.CompanyId);
        Assert.Equal("actor", capture.UserId);
        Assert.Equal("Chrome", capture.Browser);
        Assert.Equal("correlation-123", capture.CorrelationId);
        Assert.Equal("127.0.0.1", capture.IpAddress);
        Assert.DoesNotContain("secret", JsonSerializer.Serialize(capture), StringComparison.OrdinalIgnoreCase);
        Assert.Equal(status, context.Response.StatusCode);
    }

    [Fact]
    public async Task Handled_exception_uses_final_status_and_method_frames_without_message_or_file()
    {
        var context = CreateContext();
        context.SetEndpoint(new Endpoint(_ => Task.CompletedTask, new EndpointMetadataCollection(new ControllerActionDescriptor
        {
            ControllerTypeInfo = typeof(HostErrorLogMiddlewareTests).GetTypeInfo(),
            MethodInfo = typeof(HostErrorLogMiddlewareTests).GetMethod(nameof(ThrowPrivateFailure), BindingFlags.Static | BindingFlags.NonPublic)!
        }), "test"));
        var sink = new Sink();
        var handler = new HostGlobalExceptionHandler(NullLogger<HostGlobalExceptionHandler>.Instance);
        var middleware = new HostErrorLogMiddleware(async ctx =>
        {
            try { ThrowPrivateFailure(); }
            catch (Exception exception)
            {
                ctx.SetEndpoint(null);
                await handler.TryHandleAsync(ctx, exception, CancellationToken.None);
            }
        }, TimeProvider.System);

        await middleware.InvokeAsync(context, sink);

        var entry = Assert.Single(sink.Entries);
        Assert.Equal(500, entry.StatusCode);
        Assert.Equal(nameof(HostErrorLogMiddlewareTests), entry.Service);
        Assert.Equal(nameof(ThrowPrivateFailure), entry.Action);
        Assert.NotEmpty(entry.MethodFrames!);
        var text = JsonSerializer.Serialize(entry);
        Assert.DoesNotContain("secret", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(".cs:", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Password", text, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Unexpected_exception_remains_original_even_if_sink_throws()
    {
        var original = new InvalidOperationException("private secret");
        var middleware = new HostErrorLogMiddleware(_ => throw original, TimeProvider.System);
        var actual = await Assert.ThrowsAsync<InvalidOperationException>(() => middleware.InvokeAsync(CreateContext(), new Sink { Fail = true }));
        Assert.Same(original, actual);
    }

    [Fact]
    public async Task Sink_failure_does_not_change_handled_http_outcome()
    {
        var context = CreateContext();
        var middleware = new HostErrorLogMiddleware(ctx => { ctx.Response.StatusCode = 422; return Task.CompletedTask; }, TimeProvider.System);
        await middleware.InvokeAsync(context, new Sink { Fail = true });
        Assert.Equal(422, context.Response.StatusCode);
    }

    [Theory]
    [InlineData("/health/ready", 503)]
    [InlineData("/api/v1/error-logs/client", 400)]
    [InlineData("/api/v1.0/system-error-logs/settings", 403)]
    [InlineData("/api/v1/orders", 200)]
    [InlineData("/api/v1/orders", 302)]
    public async Task Success_health_and_error_log_routes_do_not_generate_noise(string path, int status)
    {
        var context = CreateContext(); context.Request.Path = path;
        var sink = new Sink();
        await new HostErrorLogMiddleware(ctx => { ctx.Response.StatusCode = status; return Task.CompletedTask; }, TimeProvider.System).InvokeAsync(context, sink);
        Assert.Empty(sink.Entries);
    }

    [Fact]
    public async Task Aborted_requests_are_not_recorded()
    {
        var context = CreateContext();
        context.RequestAborted = new CancellationToken(true);
        var sink = new Sink();
        await Assert.ThrowsAsync<OperationCanceledException>(() => new HostErrorLogMiddleware(_ => throw new OperationCanceledException(), TimeProvider.System).InvokeAsync(context, sink));
        Assert.Empty(sink.Entries);
    }

    [Fact]
    public async Task Unauthenticated_claims_cannot_assign_a_company()
    {
        var context = CreateContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(context.User.Claims));
        var sink = new Sink();
        await new HostErrorLogMiddleware(ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; }, TimeProvider.System).InvokeAsync(context, sink);
        var entry = Assert.Single(sink.Entries);
        Assert.Null(entry.UserId); Assert.Null(entry.TenantId); Assert.Null(entry.CompanyId);
    }

    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void ThrowPrivateFailure() => throw new InvalidOperationException("Password=secret; token=secret; payload=secret");

    private static DefaultHttpContext CreateContext()
    {
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/orders/secret";
        context.Request.QueryString = new QueryString("?token=secret");
        context.Request.Headers.Authorization = "Bearer secret";
        context.Request.Headers.Cookie = "secret";
        context.Request.Headers.UserAgent = "Mozilla/5.0 Chrome/150.0 secret";
        context.Response.Body = new MemoryStream();
        context.Connection.RemoteIpAddress = IPAddress.Loopback;
        context.Items[HostCorrelationContext.ItemKey] = "correlation-123";
        context.User = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, "actor"), new Claim(ExecutionContextClaimNames.TenantId, "tenant"),
            new Claim(ExecutionContextClaimNames.CompanyId, "7")
        ], "test"));
        return context;
    }

    private sealed class Sink : IErrorLogCaptureSink
    {
        public bool Fail { get; init; }
        public List<ErrorLogCapture> Entries { get; } = [];
        public bool TryCapture(ErrorLogCapture capture)
        {
            if (Fail) throw new InvalidOperationException("sink unavailable");
            Entries.Add(capture); return true;
        }
    }
}
