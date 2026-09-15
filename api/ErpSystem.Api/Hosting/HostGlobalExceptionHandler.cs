using FluentValidation;
using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.Platform.Contracts.Files;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Api.Hosting;

public sealed class HostGlobalExceptionHandler(ILogger<HostGlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is FileUploadSecurityException fileSecurityException)
        {
            logger.LogWarning(
                "File upload security policy rejected a request. FailureKind: {FailureKind}, Code: {Code}, TraceId: {TraceId}",
                fileSecurityException.FailureKind,
                fileSecurityException.Code,
                httpContext.TraceIdentifier);

            var (status, title, detail) = fileSecurityException.FailureKind switch
            {
                FileUploadSecurityFailureKind.InvalidContent =>
                    (StatusCodes.Status400BadRequest, "Invalid File Content", "The uploaded file content is not allowed."),
                FileUploadSecurityFailureKind.MalwareDetected =>
                    (StatusCodes.Status422UnprocessableEntity, "Malicious File Detected", "The uploaded file was rejected by malware protection."),
                FileUploadSecurityFailureKind.ScannerUnavailable =>
                    (StatusCodes.Status503ServiceUnavailable, "File Security Unavailable", "The file security service is temporarily unavailable."),
                _ =>
                    (StatusCodes.Status400BadRequest, "Invalid File Content", "The uploaded file content is not allowed.")
            };

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail,
                Type = status switch
                {
                    StatusCodes.Status422UnprocessableEntity => "https://tools.ietf.org/html/rfc9110#section-15.5.21",
                    StatusCodes.Status503ServiceUnavailable => "https://tools.ietf.org/html/rfc9110#section-15.6.4",
                    _ => "https://tools.ietf.org/html/rfc9110#section-15.5.1"
                }
            };
            problem.Extensions["code"] = fileSecurityException.Code;
            await HostProblemDetails.WriteAsync(httpContext, problem, cancellationToken);
            return true;
        }

        if (exception is ValidationException validationException)
        {
            logger.LogWarning("Request validation failed. TraceId: {TraceId}", httpContext.TraceIdentifier);
            var errors = validationException.Errors
                .Where(error => !string.IsNullOrWhiteSpace(error.ErrorMessage))
                .GroupBy(error => error.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.ErrorMessage).Distinct().ToArray());

            var problem = new ValidationProblemDetails(errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
                Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
            };
            await HostProblemDetails.WriteAsync(httpContext, problem, cancellationToken);
            return true;
        }

        if (exception is DbUpdateException databaseException &&
            HostDatabaseExceptionClassifier.IsUniqueConstraintViolation(databaseException))
        {
            logger.LogWarning("Database unique constraint conflict. TraceId: {TraceId}", httpContext.TraceIdentifier);
            var problem = new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Duplicate Value Conflict",
                Type = "https://tools.ietf.org/html/rfc9110#section-15.5.10",
                Detail = "A record with the same unique value already exists."
            };
            problem.Extensions["code"] = "UniqueConstraintViolation";
            await HostProblemDetails.WriteAsync(httpContext, problem, cancellationToken);
            return true;
        }

        if (exception is DbUpdateConcurrencyException or ConcurrencyConflictException)
        {
            logger.LogWarning("Database concurrency conflict. TraceId: {TraceId}", httpContext.TraceIdentifier);
            var problem = new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Concurrency Conflict",
                Type = "https://tools.ietf.org/html/rfc9110#section-15.5.10",
                Detail = "The record was changed by another operation. Reload it and try again."
            };
            problem.Extensions["code"] = "ConcurrencyConflict";
            await HostProblemDetails.WriteAsync(httpContext, problem, cancellationToken);
            return true;
        }

        logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", httpContext.TraceIdentifier);
        var unexpected = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal Server Error",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1",
            Detail = "An unexpected error occurred. Use the trace identifier when contacting support."
        };
        await HostProblemDetails.WriteAsync(httpContext, unexpected, cancellationToken);
        return true;
    }
}
