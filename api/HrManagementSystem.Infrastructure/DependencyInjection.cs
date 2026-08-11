using HrManagementSystem.Infrastructure.Dependencies;

namespace HrManagementSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddGlobalService(configuration);
        services.AddDatabaseservice(configuration);
        services.AddErrorsService();
        services.AddAuthenticationService(configuration);
        services.AddCorsService(configuration);
        services.AddHangfireService(configuration);
        services.AddCultureService();
        services.AddEntitiesService();
        services.AddExceptionService();
        services.AddFluentValidationService();
        services.AddMapsetrService();
        services.AddHealthCheckService(configuration);
        services.AddRateLimitingService();
        services.AddSwaggerService();
        services.AddVersionService();
        services.AddSendEmailService(configuration);

        return services;
    }
}
