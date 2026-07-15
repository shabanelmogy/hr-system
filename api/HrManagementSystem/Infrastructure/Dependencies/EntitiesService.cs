using Scrutor;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Jobs;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Jobs;
using HrManagementSystem.Features.GeographicalInformation.Countries.Jobs;
using HrManagementSystem.Features.GeographicalInformation.Districts.Jobs;
using HrManagementSystem.Features.GeographicalInformation.States.Jobs;
using HrManagementSystem.Features.Platform.Notifications.Services;
using HrManagementSystem.Features.Security.Authentication.Jobs;
using HrManagementSystem.Features.Security.Users.Jobs;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class EntitiesService
{
    public static IServiceCollection AddEntitiesService(this IServiceCollection services)
    {
        services.AddScoped<IEmailSender, EmailService>();
        services.AddScoped<INotificationPublisher, NotificationPublisher>();
        services.AddScoped<CountryChangedJob>();
        services.AddScoped<StateChangedJob>();
        services.AddScoped<DistrictChangedJob>();
        services.AddScoped<AddressTypeChangedJob>();
        services.AddScoped<AddressChangedJob>();
        services.AddScoped<UserChangedJob>();
        services.AddScoped<SessionRevokedJob>();

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
