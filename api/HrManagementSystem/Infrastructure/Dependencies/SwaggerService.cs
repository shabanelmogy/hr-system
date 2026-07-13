namespace HrManagementSystem.Infrastructure.Dependencies;

public static class SwaggerService
{
    public static IServiceCollection AddSwaggerService(this IServiceCollection services)
    {
        services.AddSwaggerGen();
        services.ConfigureOptions<ConfigureSwaggerOptions>();

        return services;
    }
}
