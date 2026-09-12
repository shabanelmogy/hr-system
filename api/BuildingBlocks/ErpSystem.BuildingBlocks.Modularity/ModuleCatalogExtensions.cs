using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace ErpSystem.BuildingBlocks.Modularity;

/// <summary>Explicit lifecycle helpers so every host wires modules the same way.</summary>
public static class ModuleCatalogExtensions
{
    public static IServiceCollection AddModules(
        this IServiceCollection services,
        IConfiguration configuration,
        params IModule[] modules)
    {
        var catalog = new ModuleCatalog(modules);
        services.AddSingleton(catalog);
        catalog.RegisterServices(services, configuration);
        return services;
    }

    public static void MapModuleEndpoints(this IEndpointRouteBuilder endpoints, ModuleCatalog catalog)
    {
        ArgumentNullException.ThrowIfNull(catalog);
        catalog.MapEndpoints(endpoints);
    }

    public static void ConfigureModules(this WebApplication app, ModuleCatalog catalog)
    {
        ArgumentNullException.ThrowIfNull(catalog);
        catalog.ConfigureApplication(app);
    }

    public static void ConfigureModulesEarly(this WebApplication app, ModuleCatalog catalog)
    {
        ArgumentNullException.ThrowIfNull(catalog);
        catalog.ConfigureEarlyApplication(app);
    }
}
