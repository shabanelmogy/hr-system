using ErpSystem.BuildingBlocks.Application;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.CRM.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddCrmApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();

        return services;
    }
}