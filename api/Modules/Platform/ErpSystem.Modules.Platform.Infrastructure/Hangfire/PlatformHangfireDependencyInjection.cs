using ErpSystem.Modules.Platform.Application.BackgroundJobs;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.BackgroundJobs.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;

namespace ErpSystem.Modules.Platform.Infrastructure.Hangfire;

public static class PlatformHangfireDependencyInjection
{
    public static IServiceCollection AddPlatformHangfire(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("HangfireConnection")
            ?? configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "ConnectionStrings:HangfireConnection or ConnectionStrings:DefaultConnection is required.");

        services.AddSingleton<ErrorLogJobFilter>();
        services.AddHangfire((provider, config) => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString)
            .UseFilter(provider.GetRequiredService<ErrorLogJobFilter>()));

        services.AddOptions<PlatformHangfireSettings>()
            .BindConfiguration(PlatformHangfireSettings.SectionName)
            .Validate(
                settings => settings.AllowedHosts.Count > 0 &&
                            settings.AllowedHosts.All(host => !string.IsNullOrWhiteSpace(host)),
                "HangfireSettings:AllowedHosts must contain at least one valid host.")
            .ValidateOnStart();
        services.AddSingleton<PlatformHangfireAuthorizationFilter>();
        services.AddScoped<IBackgroundJobDashboardReader, BackgroundJobDashboardReader>();
        services.AddHangfireServer();
        return services;
    }
}
