using Microsoft.Extensions.DependencyInjection.Extensions;
namespace ErpSystem.Modules.ReferenceData.Infrastructure.Mapping;

public static class MapsterService
{
    public static IServiceCollection AddReferenceDataMapster(this IServiceCollection services)
    {
        var mappingConfig = TypeAdapterConfig.GlobalSettings;
        mappingConfig.Scan(typeof(ErpSystem.Modules.ReferenceData.Application.AssemblyReference).Assembly);

        services.TryAddSingleton(mappingConfig);
        services.TryAddSingleton<IMapper>(new Mapper(mappingConfig));

        return services;
    }
}
