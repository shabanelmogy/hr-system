namespace HrManagementSystem.Infrastructure.Dependencies;

public static class MapsetrService
{
    public static IServiceCollection AddMapsetrService(this IServiceCollection services)
    {
        var mappingConfig = TypeAdapterConfig.GlobalSettings;
        mappingConfig.Scan(typeof(
            HrManagementSystem.Application.Features.GeographicalInformation.Countries.Mapping.CountryMappingConfig)
            .Assembly);
        mappingConfig.Scan(Assembly.GetExecutingAssembly());

        services.AddSingleton(mappingConfig);
        services.AddSingleton<IMapper>(new Mapper(mappingConfig));

        return services;
    }
}
