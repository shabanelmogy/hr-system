using FluentValidation;
using ErpSystem.BuildingBlocks.Application;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Contacts.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddContactsApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();

        return services;
    }
}
