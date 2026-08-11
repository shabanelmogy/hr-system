namespace HrManagementSystem.Infrastructure.Dependencies;

public static class HealthCheckService
{
    public static IServiceCollection AddHealthCheckService(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks()
                .AddSqlServer(name: "database", connectionString: configuration.GetConnectionString("DefaultConnection")!)
                .AddHangfire(options => { options.MinimumAvailableServers = 1; })
                .AddUrlGroup(name: "external api", uri: new Uri("https://www.google.com:443"))
                .AddCheck<TestHealthCheck>(name: "Check Jwt Issuer");

        return services;
    }
}
