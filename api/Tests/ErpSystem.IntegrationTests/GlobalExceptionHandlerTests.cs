using System.Text.Json;
using System.Data.Common;
using ErpSystem.Api.Hosting;
using ErpSystem.Modules.Platform.Contracts.Files;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.IntegrationTests;

public sealed class GlobalExceptionHandlerTests
{
    [Theory]
    [InlineData(FileUploadSecurityFailureKind.InvalidContent, "InvalidFileContent", StatusCodes.Status400BadRequest)]
    [InlineData(FileUploadSecurityFailureKind.MalwareDetected, "FileMalwareDetected", StatusCodes.Status422UnprocessableEntity)]
    [InlineData(FileUploadSecurityFailureKind.ScannerUnavailable, "FileScannerUnavailable", StatusCodes.Status503ServiceUnavailable)]
    public async Task FileSecurityException_ReturnsSafeStableProblemDetails(
        FileUploadSecurityFailureKind failureKind,
        string code,
        int expectedStatus)
    {
        var handler = new HostGlobalExceptionHandler(NullLogger<HostGlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Items[HostCorrelationContext.ItemKey] = "file-security-test";
        const string internalMessage = "scanner-internal-detail-must-not-appear";

        var handled = await handler.TryHandleAsync(
            context,
            new FileUploadSecurityException(failureKind, code, internalMessage),
            CancellationToken.None);

        context.Response.Body.Position = 0;
        using var response = await JsonDocument.ParseAsync(context.Response.Body);

        Assert.True(handled);
        Assert.Equal(expectedStatus, context.Response.StatusCode);
        Assert.Equal(code, response.RootElement.GetProperty("code").GetString());
        Assert.Equal("file-security-test", response.RootElement.GetProperty("correlationId").GetString());
        Assert.DoesNotContain(internalMessage, response.RootElement.GetRawText(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task ConcurrencyException_ReturnsConflictProblemDetails()
    {
        var handler = new HostGlobalExceptionHandler(NullLogger<HostGlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Items[HostCorrelationContext.ItemKey] = "concurrency-test";

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

    [Fact]
    public async Task ExpectedRevisionConflict_ReturnsStableConflictProblemDetails()
    {
        var handler = new HostGlobalExceptionHandler(NullLogger<HostGlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext { Response = { Body = new MemoryStream() } };
        context.Items[HostCorrelationContext.ItemKey] = "revision-conflict-test";

        Assert.True(await handler.TryHandleAsync(
            context,
            new ErpSystem.BuildingBlocks.Application.ConcurrencyConflictException(),
            CancellationToken.None));
        context.Response.Body.Position = 0;
        using var response = await JsonDocument.ParseAsync(context.Response.Body);
        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
        Assert.Equal("ConcurrencyConflict", response.RootElement.GetProperty("code").GetString());
    }

    [Theory]
    [InlineData(2601)]
    [InlineData(2627)]
    public async Task UniqueConstraintException_ReturnsStableConflictProblemDetails(int errorNumber)
    {
        var handler = new HostGlobalExceptionHandler(NullLogger<HostGlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Items[HostCorrelationContext.ItemKey] = "duplicate-test";
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

