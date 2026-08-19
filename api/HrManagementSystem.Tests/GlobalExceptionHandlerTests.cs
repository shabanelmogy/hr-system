using System.Text.Json;
using System.Data.Common;
using HrManagementSystem.Infrastructure.Common.Errors;
using HrManagementSystem.Infrastructure.Common.Observability;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace HrManagementSystem.Tests;

public sealed class GlobalExceptionHandlerTests
{
    [Fact]
    public async Task ConcurrencyException_ReturnsConflictProblemDetails()
    {
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Items[CorrelationContext.ItemKey] = "concurrency-test";

        var handled = await handler.TryHandleAsync(
            context,
            new DbUpdateConcurrencyException("conflict"),
            CancellationToken.None);

        context.Response.Body.Position = 0;
        using var response = await JsonDocument.ParseAsync(context.Response.Body);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
        Assert.Equal(
            "ConcurrencyConflict",
            response.RootElement.GetProperty("code").GetString());
        Assert.Equal(
            "concurrency-test",
            response.RootElement.GetProperty("correlationId").GetString());
    }

    [Theory]
    [InlineData(2601)]
    [InlineData(2627)]
    public async Task UniqueConstraintException_ReturnsStableConflictProblemDetails(int errorNumber)
    {
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Items[CorrelationContext.ItemKey] = "duplicate-test";
        var exception = new DbUpdateException(
            "duplicate",
            new TestDatabaseException(errorNumber));

        var handled = await handler.TryHandleAsync(
            context,
            exception,
            CancellationToken.None);

        context.Response.Body.Position = 0;
        using var response = await JsonDocument.ParseAsync(context.Response.Body);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
        Assert.Equal(
            "UniqueConstraintViolation",
            response.RootElement.GetProperty("code").GetString());
        Assert.Equal(
            "duplicate-test",
            response.RootElement.GetProperty("correlationId").GetString());
    }

    private sealed class TestDatabaseException : DbException
    {
        public TestDatabaseException(int errorCode)
        {
            HResult = errorCode;
        }
    }
}
