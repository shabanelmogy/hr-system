namespace HrManagementSystem.Infrastructure.Dependencies;

public static class FluentValidationService
{
    public static IServiceCollection AddFluentValidationService(this IServiceCollection services)
    {
        services.AddScoped<AsyncValidationFilter>();

        return services;
    }
}
