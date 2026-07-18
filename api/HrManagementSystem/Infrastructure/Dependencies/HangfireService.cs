namespace HrManagementSystem.Infrastructure.Dependencies;

public static class HangfireService
{
    public static IServiceCollection AddHangfireService(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("HangfireConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("ConnectionStrings:HangfireConnection is required.");

        services.AddHangfire(config => config
          .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
          .UseSimpleAssemblyNameTypeSerializer()
          .UseRecommendedSerializerSettings()
          .UseSqlServerStorage(connectionString));

        services.AddOptions<HangfireSettings>()
            .BindConfiguration(HangfireSettings.SectionName)
            .Validate(
                settings => settings.AllowedHosts.Count > 0 &&
                    settings.AllowedHosts.All(host => !string.IsNullOrWhiteSpace(host)),
                "HangfireSettings:AllowedHosts must contain at least one valid host.")
            .ValidateOnStart();
        services.AddSingleton<HangfireAuthorizationFilter>();

        services.AddHangfireServer();

        return services;
    }
}
