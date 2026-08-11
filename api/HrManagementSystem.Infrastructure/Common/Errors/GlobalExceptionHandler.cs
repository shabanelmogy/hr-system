using Microsoft.AspNetCore.Diagnostics;
using HrManagementSystem.Infrastructure.Common.Observability;

namespace HrManagementSystem.Infrastructure.Common.Errors
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            if (exception is FluentValidation.ValidationException validationException)
            {
                _logger.LogWarning(
                    "Request validation failed. TraceId: {TraceId}",
                    httpContext.TraceIdentifier);

                var errors = validationException.Errors
                    .Where(error => !string.IsNullOrWhiteSpace(error.ErrorMessage))
                    .GroupBy(error => error.PropertyName)
                    .ToDictionary(
                        group => group.Key,
                        group => group
                            .Select(error => error.ErrorMessage)
                            .Distinct()
                            .ToArray());

                var validationProblem = new ValidationProblemDetails(errors)
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "One or more validation errors occurred.",
                    Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
                };
                validationProblem.Extensions["traceId"] = httpContext.TraceIdentifier;
                validationProblem.Extensions["correlationId"] = httpContext.GetCorrelationId();

                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                await httpContext.Response.WriteAsJsonAsync(validationProblem, cancellationToken);
                return true;
            }

            if (exception is DbUpdateConcurrencyException)
            {
                _logger.LogWarning(
                    "Database concurrency conflict. TraceId: {TraceId}",
                    httpContext.TraceIdentifier);

                var concurrencyProblem = new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Concurrency Conflict",
                    Type = "https://tools.ietf.org/html/rfc9110#section-15.5.10",
                    Detail = "The record was changed by another operation. Reload it and try again."
                };
                concurrencyProblem.Extensions["code"] = "ConcurrencyConflict";
                concurrencyProblem.Extensions["traceId"] = httpContext.TraceIdentifier;
                concurrencyProblem.Extensions["correlationId"] = httpContext.GetCorrelationId();

                httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
                await httpContext.Response.WriteAsJsonAsync(concurrencyProblem, cancellationToken);
                return true;
            }

            _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", httpContext.TraceIdentifier);
            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1",
                Detail = "An unexpected error occurred. Use the trace identifier when contacting support."
            };
            problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;
            problemDetails.Extensions["correlationId"] = httpContext.GetCorrelationId();

            httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}
