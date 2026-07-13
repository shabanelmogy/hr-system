namespace HrManagementSystem.Infrastructure.Dependencies;

public static class FluentValidationService
{
    public static IServiceCollection AddFluentValidationService(this IServiceCollection services, Assembly? assembly = null)
    {
        // Use the provided assembly, or fall back to the executing assembly by default
        assembly ??= Assembly.GetExecutingAssembly();

        services.AddValidatorsFromAssembly(assembly);
        services.AddScoped<AsyncValidationFilter>();

        return services;
    }
}
