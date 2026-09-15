using System.Security.Claims;
using ErpSystem.Api.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace ErpSystem.IntegrationTests;

public sealed class HostProblemDetailsTests
{
    [Fact]
    public async Task HostWriter_UsesProblemJsonAndAddsTraceAndCorrelation()
    {
        var context = new DefaultHttpContext
        {
            TraceIdentifier = "trace-123"
        };
        context.Items[HostCorrelationContext.ItemKey] = "corr-123";
        context.Response.Body = new MemoryStream();
        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Conflict"
        };

        await HostProblemDetails.WriteAsync(context, problem);

        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
        Assert.Equal(HostProblemDetails.ContentType, context.Response.ContentType);
        Assert.Equal("trace-123", problem.Extensions["traceId"]);
        Assert.Equal("corr-123", problem.Extensions["correlationId"]);
    }

    [Fact]
    public async Task MvcProblemFilter_EnrichesModuleProblemResultsWithoutChangingStatus()
    {
        var httpContext = new DefaultHttpContext
        {
            TraceIdentifier = "trace-filter"
        };
        httpContext.Items[HostCorrelationContext.ItemKey] = "corr-filter";
        var actionContext = new ActionContext(
            httpContext,
            new RouteData(),
            new ActionDescriptor());
        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Request failed"
        };
        var result = new BadRequestObjectResult(problem);
        var executing = new ResultExecutingContext(
            actionContext,
            [],
            result,
            controller: new object());
        var filter = new HostProblemDetailsResultFilter();

        await filter.OnResultExecutionAsync(executing, () =>
            Task.FromResult(new ResultExecutedContext(
                actionContext,
                [],
                result,
                controller: new object())));

        Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
        Assert.Equal([HostProblemDetails.ContentType], result.ContentTypes);
        Assert.Equal("trace-filter", problem.Extensions["traceId"]);
        Assert.Equal("corr-filter", problem.Extensions["correlationId"]);
    }
}

