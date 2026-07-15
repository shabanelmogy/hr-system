namespace HrManagementSystem.Infrastructure.Dependencies;

public static class AllDependencies
{
    public static IServiceCollection AddAllDependencies(this IServiceCollection services, IConfiguration configuration)
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
