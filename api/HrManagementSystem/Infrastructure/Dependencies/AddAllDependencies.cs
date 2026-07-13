using HrManagementSystem.Features.Platform.Notifications.Settings;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class AllDependencies
{
    public static IServiceCollection AddAllDependencies(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<NotificationSettings>()
            .Bind(configuration.GetSection(NotificationSettings.SectionName))
            .Validate(settings => settings.DeliveryBatchSize is > 0 and <= 1000,
                "Notification delivery batch size must be between 1 and 1000.")
            .Validate(settings => settings.MaxDeliveryAttempts is > 0 and <= 20,
                "Notification maximum delivery attempts must be between 1 and 20.")
            .Validate(settings => settings.DeliveryLeaseSeconds is >= 30 and <= 900,
                "Notification delivery lease must be between 30 and 900 seconds.")
            .Validate(settings => settings.RetentionDays > 0 && settings.DismissedRetentionDays > 0,
                "Notification retention periods must be greater than zero.")
            .ValidateOnStart();

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
