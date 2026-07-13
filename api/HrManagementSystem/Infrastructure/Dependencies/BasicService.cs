using System.Text.Json.Serialization;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class BasicService
{
    public static IServiceCollection AddGlobalService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        services.AddHttpContextAccessor();
        services.AddHttpClient();

        var syncfusionLicense = configuration["Syncfusion:LicenseKey"];
        if (!string.IsNullOrWhiteSpace(syncfusionLicense))
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(syncfusionLicense);

        services.AddDistributedMemoryCache();
        services.AddSignalR();
        services.AddHybridCache();

        return services;
    }
}
