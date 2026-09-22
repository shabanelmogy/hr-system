using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Services;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;

namespace ErpSystem.Modules.HR.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddGlobalService(configuration);
        services.AddDatabaseservice(configuration);
        services.AddErrorsService();
        services.AddEntitiesService();
        services.AddFluentValidationService();
        services.AddMapsterService();
        services.AddHttpClient<IAttendanceConnectorClient, AttendanceConnectorClient>((_, client) =>
        {
            var baseUrl = configuration["AttendanceConnector:BaseUrl"];
            if (Uri.TryCreate(baseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;

            client.Timeout = TimeSpan.FromSeconds(Math.Clamp(
                configuration.GetValue<int?>("AttendanceConnector:TimeoutSeconds") ?? 120,
                5,
                300));
            client.MaxResponseContentBufferSize = 32 * 1024 * 1024;
        });

        return services;
    }
}
