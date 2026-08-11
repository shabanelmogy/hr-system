namespace HrManagementSystem.Infrastructure.Dependencies;

public static class MapsetrService
{
    public static IServiceCollection AddMapsetrService(this IServiceCollection services)
    {
        var mappingConfig = TypeAdapterConfig.GlobalSettings;
        mappingConfig.Scan(Assembly.GetExecutingAssembly());

        services.AddSingleton<IMapper>(new Mapper(mappingConfig));

        return services;
    }
}
