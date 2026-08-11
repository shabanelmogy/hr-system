using Microsoft.Extensions.Diagnostics.HealthChecks;

public class TestHealthCheck : IHealthCheck
{
    private readonly JwtOptions _jwtSettings;

    public TestHealthCheck(IOptions<JwtOptions> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if Issuer is null or empty
            if (_jwtSettings.Issuer != "Techinal Support App")
            {
                return await Task.FromResult(HealthCheckResult.Unhealthy("JWT Issuer is not configured."));
            }

            // Return healthy status if all checks pass
            return await Task.FromResult(HealthCheckResult.Healthy());
        }
        catch (Exception ex)
        {
            return await Task.FromResult(HealthCheckResult.Unhealthy("An error occurred while checking health.", ex));
        }
    }
}
