using Scrutor;
using HrManagementSystem.Features.Platform.Notifications.Services;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class EntitiesService
{
    public static IServiceCollection AddEntitiesService(this IServiceCollection services)
    {
        services.AddScoped<IEmailSender, EmailService>();
        services.AddScoped<INotificationPublisher, NotificationPublisher>();

        services.Scan(scan => scan
            .FromAssemblies(typeof(AllDependencies).Assembly)
            .AddClasses(classes => classes.Where(type =>
                type is { IsAbstract: false, IsGenericTypeDefinition: false } &&
                type.Name.EndsWith("Service", StringComparison.Ordinal) &&
                type.GetInterfaces().Any(@interface =>
                    @interface.Name.EndsWith("Service", StringComparison.Ordinal))))
            .UsingRegistrationStrategy(RegistrationStrategy.Skip)
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
