using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Presentation.Common.Errors;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class ResultProblemHardeningTests
{
    [Fact]
    public void ResultProblem_MapsApplicationErrorTypeToHttpStatusCode()
    {
        var result = Result.Failure(new Error("Test.NotFound", "Not found", ErrorType.NotFound));

        var response = result.ToProblem();

        Assert.Equal(404, response.StatusCode);
        var details = Assert.IsType<ProblemDetails>(response.Value);
        Assert.Equal(404, details.Status);
    }

    [Fact]
    public void ResultProblem_MapsServiceUnavailableToHttp503()
    {
        var result = Result.Failure(new Error(
            "Test.ServiceUnavailable",
            "Service unavailable",
            ErrorType.ServiceUnavailable));

        var response = result.ToProblem();

        Assert.Equal(503, response.StatusCode);
        var details = Assert.IsType<ProblemDetails>(response.Value);
        Assert.Equal(503, details.Status);
    }

    [Fact]
    public void ResultProblem_MapsPayloadTooLargeToHttp413()
    {
        var result = Result.Failure(new Error(
            "Test.PayloadTooLarge",
            "Payload too large",
            ErrorType.PayloadTooLarge));

        var response = result.ToProblem();

        Assert.Equal(413, response.StatusCode);
        var details = Assert.IsType<ProblemDetails>(response.Value);
        Assert.Equal(413, details.Status);
    }
}
