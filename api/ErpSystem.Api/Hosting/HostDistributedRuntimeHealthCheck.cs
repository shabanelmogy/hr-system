using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ErpSystem.Api.Hosting;

public sealed class HostDistributedRuntimeHealthCheck(IDistributedCache distributedCache) : IHealthCheck
{
    private const string ProbeKey = "host:health:distributed-runtime";

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await distributedCache.GetAsync(ProbeKey, cancellationToken).ConfigureAwait(false);
            return HealthCheckResult.Healthy("Redis distributed runtime is reachable.");
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return HealthCheckResult.Unhealthy("Redis distributed runtime is unavailable.");
        }
    }
}
