namespace HrManagementSystem.Infrastructure.Dependencies;

public static class ExceptionService
{
    public static IServiceCollection AddExceptionService(this IServiceCollection services)
    {
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        return services;
    }
}
