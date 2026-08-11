namespace HrManagementSystem.Infrastructure.Dependencies;

public static class HealthCheckService
{
    public static IServiceCollection AddHealthCheckService(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") ??
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddHealthChecks()
            .AddSqlServer(
                connectionString: connectionString,
                name: "database",
                tags: ["ready"])
            .AddHangfire(
                options => options.MinimumAvailableServers = 1,
                tags: ["ready"]);

        return services;
    }
}
