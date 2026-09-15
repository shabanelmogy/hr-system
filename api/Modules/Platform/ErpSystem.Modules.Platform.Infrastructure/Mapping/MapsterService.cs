using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.Platform.Infrastructure.Mapping;

public static class MapsterService
{
    public static IServiceCollection AddPlatformMapster(this IServiceCollection services)
    {
        var mappingConfig = TypeAdapterConfig.GlobalSettings;
        mappingConfig.Scan(Assembly.GetExecutingAssembly());

        services.TryAddSingleton(mappingConfig);
        services.TryAddSingleton<IMapper>(new Mapper(mappingConfig));

        return services;
    }
}
