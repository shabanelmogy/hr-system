using System.Reflection;
using ErpSystem.BuildingBlocks.Application;
using OpenTelemetry.Exporter;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace ErpSystem.Api.Hosting;

public static class HostOpenTelemetryServiceCollectionExtensions
{
    private static readonly string[] ExcludedRequestPaths =
    [
        "/health/live",
        "/health/ready"
    ];

    public static IServiceCollection AddHostOpenTelemetry(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var section = configuration.GetSection(HostOpenTelemetrySettings.SectionName);
        var settings = section.Get<HostOpenTelemetrySettings>() ?? new HostOpenTelemetrySettings();

        services.AddOptions<HostOpenTelemetrySettings>()
            .Bind(section)
            .Validate(IsValid, "OpenTelemetry settings are invalid.")
            .ValidateOnStart();

        if (!settings.Enabled)
            return services;

        if (!IsValid(settings))
            throw new InvalidOperationException("OpenTelemetry settings are invalid.");

        var endpoint = new Uri(settings.OtlpEndpoint, UriKind.Absolute);
        var protocol = ParseProtocol(settings.OtlpProtocol);
        var serviceVersion = typeof(HostOpenTelemetryServiceCollectionExtensions)
            .Assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;

        services.AddOpenTelemetry()
            .ConfigureResource(resource => resource
                .AddService(
                    serviceName: settings.ServiceName,
                    serviceNamespace: settings.ServiceNamespace,
                    serviceVersion: serviceVersion,
                    serviceInstanceId: Environment.MachineName)
                .AddAttributes([
                    new KeyValuePair<string, object>(
                        "deployment.environment.name",
                        configuration["ASPNETCORE_ENVIRONMENT"] ??
                        configuration["DOTNET_ENVIRONMENT"] ??
                        Environments.Production)
                ]))
            .WithTracing(tracing =>
            {
                tracing
                    .SetSampler(new ParentBasedSampler(
                        new TraceIdRatioBasedSampler(settings.TraceSamplingRatio)))
                    .AddSource(ApplicationTelemetry.ActivitySourceName)
                    .AddAspNetCoreInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.Filter = context => !IsExcludedPath(context.Request.Path);
                    })
                    .AddHttpClientInstrumentation(options => options.RecordException = true)
                    .AddOtlpExporter(options =>
                    {
                        options.Endpoint = endpoint;
                        options.Protocol = protocol;
                    });
            })
            .WithMetrics(metrics => metrics
                .AddMeter(ApplicationTelemetry.MeterName)
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = endpoint;
                    options.Protocol = protocol;
                }));

        return services;
    }

    private static bool IsValid(HostOpenTelemetrySettings settings) =>
        !string.IsNullOrWhiteSpace(settings.ServiceName) &&
        !string.IsNullOrWhiteSpace(settings.ServiceNamespace) &&
        settings.TraceSamplingRatio is >= 0 and <= 1 &&
        (!settings.Enabled ||
         (Uri.TryCreate(settings.OtlpEndpoint, UriKind.Absolute, out var endpoint) &&
          (endpoint.Scheme == Uri.UriSchemeHttp || endpoint.Scheme == Uri.UriSchemeHttps) &&
          TryParseProtocol(settings.OtlpProtocol, out _)));

    private static bool IsExcludedPath(PathString path) =>
        ExcludedRequestPaths.Any(excluded => path.StartsWithSegments(excluded));

    private static OtlpExportProtocol ParseProtocol(string? value) =>
        TryParseProtocol(value, out var protocol)
            ? protocol
            : throw new InvalidOperationException("OpenTelemetry settings are invalid.");

    private static bool TryParseProtocol(string? value, out OtlpExportProtocol protocol)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            protocol = default;
            return false;
        }

        switch (value.Trim().ToLowerInvariant())
        {
            case "grpc":
                protocol = OtlpExportProtocol.Grpc;
                return true;
            case "http/protobuf":
            case "httpprotobuf":
                protocol = OtlpExportProtocol.HttpProtobuf;
                return true;
            default:
                protocol = default;
                return false;
        }
    }
}
