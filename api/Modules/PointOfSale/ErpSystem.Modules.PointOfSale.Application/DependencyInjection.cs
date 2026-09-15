using ErpSystem.BuildingBlocks.Application;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.PointOfSale.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddPointOfSaleApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();

        return services;
    }
}