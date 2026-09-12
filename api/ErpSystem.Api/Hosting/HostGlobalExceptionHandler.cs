using FluentValidation;
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

        if (exception is DbUpdateConcurrencyException)
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
