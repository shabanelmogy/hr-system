using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ErpSystem.Api.Hosting;

public sealed class CrystalReportRuntimeHealthCheck(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<CrystalReportRuntimeHealthCheck> logger) : IHealthCheck
{
    private static readonly Action<ILogger, int, Exception?> RuntimeUnhealthy =
        LoggerMessage.Define<int>(
            LogLevel.Warning,
            new EventId(1, nameof(RuntimeUnhealthy)),
            "Crystal report runtime readiness returned HTTP {StatusCode}.");

    private static readonly Action<ILogger, Exception?> RuntimeCheckFailed =
        LoggerMessage.Define(
            LogLevel.Warning,
            new EventId(2, nameof(RuntimeCheckFailed)),
            "Crystal report runtime readiness check failed.");

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "internal/reports/health");
        var apiKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            apiKey = configuration["CrystalReports:RuntimeApiKey"];
        if (!string.IsNullOrWhiteSpace(apiKey))
            request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);

        try
        {
            using var response = await httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);
            if (response.IsSuccessStatusCode)
                return HealthCheckResult.Healthy("Crystal report runtime is ready.");

            RuntimeUnhealthy(logger, (int)response.StatusCode, null);
            return HealthCheckResult.Unhealthy("Crystal report runtime is unavailable.");
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException)
        {
            RuntimeCheckFailed(logger, exception);
            return HealthCheckResult.Unhealthy("Crystal report runtime is unavailable.");
        }
    }
}
