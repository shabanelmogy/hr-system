using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ErpSystem.Modules.Platform.Infrastructure.Files;

public sealed class ClamAvHealthCheck(IFileMalwareScanner scanner) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var healthy = await scanner.PingAsync(cancellationToken).ConfigureAwait(false);
        return healthy
            ? HealthCheckResult.Healthy("ClamAV scanner is reachable.")
            : HealthCheckResult.Unhealthy("ClamAV scanner is unavailable.");
    }
}
