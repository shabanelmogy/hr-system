using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ErpSystem.Api.Hosting;

public sealed class ModuleSchemaCompatibilityHealthCheck(
    ModuleCatalog catalog,
    IServiceProvider services) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var pending = await catalog
                .GetPendingMigrationsAsync(services, cancellationToken)
                .ConfigureAwait(false);

            if (pending.Count == 0)
                return HealthCheckResult.Healthy("All installed module schemas are compatible.");

            var data = pending.ToDictionary(
                entry => entry.Key,
                entry => (object)entry.Value.ToArray(),
                StringComparer.OrdinalIgnoreCase);
            return HealthCheckResult.Unhealthy(
                "One or more installed modules have pending database migrations.",
                data: data);
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy(
                "Module schema compatibility could not be verified.",
                exception);
        }
    }
}
