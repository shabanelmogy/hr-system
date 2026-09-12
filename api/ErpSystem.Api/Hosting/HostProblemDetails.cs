using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ErpSystem.Api.Hosting;

public static class HostProblemDetails
{
    public const string ContentType = "application/problem+json";

    public static void Enrich(ProblemDetails problem, HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(problem);
        ArgumentNullException.ThrowIfNull(context);

        problem.Extensions["traceId"] = context.TraceIdentifier;
        problem.Extensions["correlationId"] = context.GetCorrelationId();
    }

    public static async Task WriteAsync(
        HttpContext context,
        ProblemDetails problem,
        CancellationToken cancellationToken = default)
    {
        Enrich(problem, context);
        context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        context.Response.ContentType = ContentType;
        await context.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: ContentType,
            cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}

/// <summary>
/// Enriches ProblemDetails returned by module MVC controllers. This keeps module
/// contracts transport-local while enforcing one host-level tracing envelope.
/// </summary>
public sealed class HostProblemDetailsResultFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(
        ResultExecutingContext context,
        ResultExecutionDelegate next)
    {
        if (context.Result is ObjectResult { Value: ProblemDetails problem } objectResult)
        {
            HostProblemDetails.Enrich(problem, context.HttpContext);
            objectResult.ContentTypes.Clear();
            objectResult.ContentTypes.Add(HostProblemDetails.ContentType);
        }

        await next().ConfigureAwait(false);
    }
}
