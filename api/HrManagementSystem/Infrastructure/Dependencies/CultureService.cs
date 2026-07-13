namespace HrManagementSystem.Infrastructure.Dependencies;

public static class CultureService
{
    public static IServiceCollection AddCultureService(this IServiceCollection services)
    {
        services.AddLocalization();
        services.AddDistributedMemoryCache();
        services.AddSingleton<IStringLocalizerFactory, JsonStringLocalizerFactory>();

        services.AddMvc()
        .AddDataAnnotationsLocalization(options =>
        {
            options.DataAnnotationLocalizerProvider = (type, factory) =>
        factory.Create(typeof(JsonStringLocalizerFactory));
        });

        return services;
    }
}
