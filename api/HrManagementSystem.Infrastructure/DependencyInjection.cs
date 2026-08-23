using HrManagementSystem.Infrastructure.Dependencies;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;

namespace HrManagementSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
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
        services.Configure<CrystalReportStorageOptions>(
            configuration.GetSection(CrystalReportStorageOptions.SectionName));
        services.AddHttpClient<ICrystalReportInspector, CrystalReportInspectorClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
            if (Uri.TryCreate(options.InspectorBaseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<ICrystalReportLegacySource, CrystalReportLegacySourceClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
            if (Uri.TryCreate(options.InspectorBaseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<ICrystalReportRenderer, CrystalReportRendererClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
            if (Uri.TryCreate(options.InspectorBaseUrl, UriKind.Absolute, out var baseAddress))
                client.BaseAddress = baseAddress;
            client.Timeout = TimeSpan.FromMinutes(2);
        });

        return services;
    }
}
