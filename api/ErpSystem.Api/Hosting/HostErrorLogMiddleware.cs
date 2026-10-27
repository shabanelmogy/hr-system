using System.Diagnostics;
using ErpSystem.BuildingBlocks.Application.Diagnostics;
using Microsoft.AspNetCore.Routing;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace ErpSystem.Api.Hosting;

/// <summary>Observes the final HTTP outcome without storing request or exception payloads.</summary>
public sealed class HostErrorLogMiddleware(RequestDelegate next, TimeProvider clock)
{
    internal static readonly object ExceptionKey = new();

    public async Task InvokeAsync(HttpContext context, IErrorLogCaptureSink sink)
    {
        if (IsExcluded(context.Request.Path))
        {
            await next(context);
            return;
        }

        var started = Stopwatch.GetTimestamp();
        var descriptor = context.GetEndpoint()?.Metadata.GetMetadata<ControllerActionDescriptor>();
        Exception? unhandled = null;
        try
        {
            await next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            unhandled = exception;
            throw;
        }
        finally
        {
            if (!context.RequestAborted.IsCancellationRequested &&
                (unhandled is not null || context.Response.StatusCode >= 400))
            {
                // Capture is deliberately best effort, including a defensive guard against
                // a faulty sink implementation. Never mask the original HTTP outcome.
                try
                {
                    var failure = unhandled ?? context.Items[ExceptionKey] as Exception;
                    var status = unhandled is null ? context.Response.StatusCode : 500;
                    var authenticated = context.User.Identity?.IsAuthenticated == true;
                    var userId = authenticated ? context.User.FindFirstValue(ClaimTypes.NameIdentifier) : null;
                    var tenantId = userId is not null ? context.User.FindFirstValue(ExecutionContextClaimNames.TenantId) : null;
                    var companyId = userId is not null && int.TryParse(context.User.FindFirstValue(ExecutionContextClaimNames.CompanyId), out var company) && company > 0
                        ? company : (int?)null;
                    descriptor ??= context.GetEndpoint()?.Metadata.GetMetadata<ControllerActionDescriptor>();
                    sink.TryCapture(new ErrorLogCapture(
                        Guid.NewGuid(), clock.GetUtcNow(), ErrorLogSource.Api,
                        status >= 500 ? ErrorLogSeverity.Error : ErrorLogSeverity.Warning, status,
                        userId, tenantId, companyId,
                        descriptor?.ControllerTypeInfo.Name ?? "HTTP",
                        descriptor?.MethodInfo.Name ?? HttpMethod(context.Request.Method),
                        (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds,
                        context.Items[HostCorrelationContext.ItemKey] as string,
                        status >= 500 ? "HttpServerError" : "HttpClientError", "http",
                        Browser(context.Request.Headers.UserAgent.ToString()),
                        context.Connection.RemoteIpAddress?.ToString(), Diagnostics(context, failure)));
                }
                catch
                {
                    // Sink availability is never a request dependency.
                }
            }
        }
    }

    private static bool IsExcluded(PathString path)
    {
        if (path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase)) return true;
        var segments = (path.Value ?? string.Empty).Split('/', StringSplitOptions.RemoveEmptyEntries);
        return segments.Length >= 3 && segments[0].Equals("api", StringComparison.OrdinalIgnoreCase) &&
               segments[1].StartsWith('v') && (segments[2].Equals("error-logs", StringComparison.OrdinalIgnoreCase) ||
               segments[2].Equals("system-error-logs", StringComparison.OrdinalIgnoreCase));
    }

    private static string HttpMethod(string method) => method switch
    {
        "GET" or "POST" or "PUT" or "PATCH" or "DELETE" or "HEAD" or "OPTIONS" => method,
        _ => "OTHER"
    };

    private static string Browser(string agent) => agent switch
    {
        var value when value.Contains("Edg/", StringComparison.Ordinal) => "Edge",
        var value when value.Contains("Chrome/", StringComparison.Ordinal) => "Chrome",
        var value when value.Contains("Firefox/", StringComparison.Ordinal) => "Firefox",
        var value when value.Contains("Safari/", StringComparison.Ordinal) => "Safari",
        _ => "Other"
    };

    private static string[] Diagnostics(HttpContext context, Exception? failure)
    {
        var activity = Activity.Current;
        var lines = new List<string>
        {
            $"HttpMethod: {HttpMethod(context.Request.Method)}",
            $"RouteTemplate: {(context.GetEndpoint() as RouteEndpoint)?.RoutePattern.RawText ?? "Unmatched"}",
            $"RequestTrace: {context.TraceIdentifier}",
            $"RuntimeVersion: {Environment.Version}",
            $"ApplicationVersion: {typeof(HostErrorLogMiddleware).Assembly.GetName().Version}"
        };
        if (activity is not null)
        {
            lines.Add($"TraceId: {activity.TraceId}");
            lines.Add($"SpanId: {activity.SpanId}");
        }
        lines.AddRange(SafeExceptionDiagnostics.Capture(failure));
        return lines.ToArray();
    }
}
