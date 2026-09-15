using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class MapsterService
{
    public static IServiceCollection AddMapsterService(this IServiceCollection services)
    {
        var mappingConfig = TypeAdapterConfig.GlobalSettings;
        mappingConfig.Scan(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly);

        services.TryAddSingleton(mappingConfig);
        services.TryAddSingleton<IMapper>(new Mapper(mappingConfig));

        return services;
    }
}
