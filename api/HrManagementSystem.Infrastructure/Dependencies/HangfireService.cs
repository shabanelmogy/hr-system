namespace HrManagementSystem.Infrastructure.Dependencies;

using HrManagementSystem.Application.Features.Platform.BackgroundJobs.Services;
using HrManagementSystem.Infrastructure.Features.Platform.BackgroundJobs.Services;

public static class HangfireService
{
    public static IServiceCollection AddHangfireService(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("HangfireConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "ConnectionStrings:HangfireConnection or ConnectionStrings:DefaultConnection is required.");

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
        services.AddScoped<IBackgroundJobDashboardService, BackgroundJobDashboardService>();

        services.AddHangfireServer();

        return services;
    }
}
