namespace HrManagementSystem.Infrastructure.Dependencies;

public static class CorsService
{
    public static IServiceCollection AddCorsService(this IServiceCollection services,IConfiguration configuration)
    {

        var allowedOrigins = configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials(); // Required for SignalR
            });
        });

        return services;
    }
}
