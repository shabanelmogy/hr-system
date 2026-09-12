namespace ErpSystem.Api.Hosting;

public sealed class HostOpenTelemetrySettings
{
    public const string SectionName = "OpenTelemetry";

    public bool Enabled { get; init; }
    public string ServiceName { get; init; } = "ErpSystem.Api";
    public string ServiceNamespace { get; init; } = "ErpSystem";
    public double TraceSamplingRatio { get; init; } = 0.1;
    public string OtlpEndpoint { get; init; } = "http://localhost:4317";
    public string OtlpProtocol { get; init; } = "grpc";
}
