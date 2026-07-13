using System.Text.Json.Serialization;

namespace HrManagementSystem.Infrastructure.Dependencies;

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

        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        services.AddHttpContextAccessor();
        services.AddHttpClient("Google", client =>
        {
            client.BaseAddress = new Uri("https://www.googleapis.com/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        var syncfusionLicense = configuration["Syncfusion:LicenseKey"];
        if (!string.IsNullOrWhiteSpace(syncfusionLicense))
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(syncfusionLicense);

        services.AddDistributedMemoryCache();
        services.AddSignalR();
        services.AddHybridCache(options =>
        {
            options.DefaultEntryOptions = new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromMinutes(10),
                LocalCacheExpiration = TimeSpan.FromMinutes(2)
            };
        });

        return services;
    }
}
