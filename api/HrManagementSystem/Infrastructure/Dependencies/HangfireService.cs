namespace HrManagementSystem.Infrastructure.Dependencies;

public static class HangfireService
{
    public static IServiceCollection AddHangfireService(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHangfire(config => config
          .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
          .UseSimpleAssemblyNameTypeSerializer()
          .UseRecommendedSerializerSettings()
          .UseSqlServerStorage(configuration.GetConnectionString("HangfireConnection")));

        services.Configure<HangfireSettings>(configuration.GetSection("HangfireSettings"));
        services.AddSingleton<HangfireAuthorizationFilter>();

        services.AddHangfireServer();

        return services;
    }
}
