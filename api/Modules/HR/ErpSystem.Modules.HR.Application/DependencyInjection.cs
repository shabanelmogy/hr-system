using FluentValidation;
using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.PlatformCompatibility;
using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.HR.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();
        services.AddScoped<ISelectionChallengeSource, PlatformSelectionChallengeSource>();

        return services;
    }
}
