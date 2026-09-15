using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Errors;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Errors;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Errors;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Errors;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Errors;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.ReferenceData.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddReferenceDataApplication(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();
        services.AddScoped<CountryErrors>();
        services.AddScoped<StateErrors>();
        services.AddScoped<DistrictErrors>();
        services.AddScoped<AddressTypeErrors>();
        services.AddScoped<AddressErrors>();

        return services;
    }
}
