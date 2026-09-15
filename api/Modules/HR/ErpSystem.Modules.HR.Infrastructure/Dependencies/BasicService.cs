using System.Text.Json.Serialization;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class BasicService
{
    public static IServiceCollection AddGlobalService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers(options =>
        {
            options.Filters.AddService<AsyncValidationFilter>();
        }).AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        services.AddHttpClient("Google", client =>
        {
            client.BaseAddress = new Uri("https://www.googleapis.com/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        var syncfusionLicense = configuration["Syncfusion:LicenseKey"];
        if (!string.IsNullOrWhiteSpace(syncfusionLicense))
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(syncfusionLicense);

        return services;
    }
}
