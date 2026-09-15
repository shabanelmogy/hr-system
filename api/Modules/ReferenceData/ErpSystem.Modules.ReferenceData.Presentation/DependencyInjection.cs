using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.ReferenceData.Presentation;

public static class DependencyInjection
{
    /// <summary>
    /// Registers the ReferenceData controller assembly with MVC so module endpoints
    /// are discovered by the single host without referencing Infrastructure.
    /// Called from the module composition root, never directly by the host.
    /// </summary>
    public static IServiceCollection AddReferenceDataPresentation(this IServiceCollection services)
    {
        services.AddControllers().AddApplicationPart(AssemblyReference.Assembly);
        return services;
    }
}