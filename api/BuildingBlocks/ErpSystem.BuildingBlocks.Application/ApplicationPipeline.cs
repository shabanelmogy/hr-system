using System.Diagnostics;
using System.Diagnostics.Metrics;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace ErpSystem.BuildingBlocks.Application;

public static class ApplicationTelemetry
{
    public const string ActivitySourceName = "ErpSystem.Application";
    public const string MeterName = "ErpSystem.Application";

    internal static readonly ActivitySource ActivitySource = new(ActivitySourceName);
    internal static readonly Meter Meter = new(MeterName);
    internal static readonly Histogram<double> RequestDuration = Meter.CreateHistogram<double>(
        "erp.application.request.duration",
        unit: "ms",
        description: "Duration of CQRS application requests.");
    internal static readonly Counter<long> RequestCount = Meter.CreateCounter<long>(
        "erp.application.request.count",
        unit: "{request}",
        description: "Number of completed CQRS application requests.");
}

/// <summary>
/// Logs request type and timing without serializing or logging the request payload.
/// </summary>
public sealed class RequestLoggingBehavior<TRequest, TResponse>(
    ILogger<RequestLoggingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var moduleName = typeof(TRequest).Assembly.GetName().Name ?? "unknown";
        var stopwatch = Stopwatch.StartNew();
        using var activity = ApplicationTelemetry.ActivitySource.StartActivity(
            requestName,
            ActivityKind.Internal);
        activity?.SetTag("erp.application.request.name", requestName);
        activity?.SetTag("erp.application.module.name", moduleName);

        logger.LogDebug("Handling application request {RequestName}", requestName);

        try
        {
            var response = await next(cancellationToken);
            stopwatch.Stop();
            activity?.SetStatus(ActivityStatusCode.Ok);
            RecordTelemetry(requestName, moduleName, "success", stopwatch.Elapsed.TotalMilliseconds);
            logger.LogInformation(
                "Handled application request {RequestName} in {ElapsedMilliseconds} ms",
                requestName,
                stopwatch.ElapsedMilliseconds);
            return response;
        }
        catch (Exception exception)
        {
            stopwatch.Stop();
            activity?.SetStatus(ActivityStatusCode.Error);
            activity?.SetTag("error.type", exception.GetType().FullName);
            RecordTelemetry(requestName, moduleName, "error", stopwatch.Elapsed.TotalMilliseconds);
            logger.LogError(
                exception,
                "Application request {RequestName} failed after {ElapsedMilliseconds} ms",
                requestName,
                stopwatch.ElapsedMilliseconds);
            throw;
        }
    }

    private static void RecordTelemetry(
        string requestName,
        string moduleName,
        string outcome,
        double elapsedMilliseconds)
    {
        var tags = new TagList
        {
            { "erp.application.request.name", requestName },
            { "erp.application.module.name", moduleName },
            { "erp.application.request.outcome", outcome }
        };
        ApplicationTelemetry.RequestDuration.Record(elapsedMilliseconds, tags);
        ApplicationTelemetry.RequestCount.Add(1, tags);
    }
}

/// <summary>
/// Runs all validators registered for a request before invoking its handler.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var validatorList = validators as IValidator<TRequest>[] ?? validators.ToArray();
        if (validatorList.Length == 0)
            return await next(cancellationToken);

        var failures = new List<ValidationFailure>();
        foreach (var validator in validatorList)
        {
            var result = await validator.ValidateAsync(
                new ValidationContext<TRequest>(request),
                cancellationToken);
            failures.AddRange(result.Errors.Where(failure => failure is not null));
        }

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next(cancellationToken);
    }
}

public static class ApplicationPipelineExtensions
{
    /// <summary>
    /// Registers the shared application pipeline once for a module composition root.
    /// </summary>
    public static IServiceCollection AddApplicationPipeline(this IServiceCollection services)
    {
        services.TryAddEnumerable(ServiceDescriptor.Transient(
            typeof(IPipelineBehavior<,>),
            typeof(RequestLoggingBehavior<,>)));
        services.TryAddEnumerable(ServiceDescriptor.Transient(
            typeof(IPipelineBehavior<,>),
            typeof(ValidationBehavior<,>)));

        return services;
    }
}
