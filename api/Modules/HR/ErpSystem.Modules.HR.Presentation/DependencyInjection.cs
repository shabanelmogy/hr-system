using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.HR.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddHRPresentation(this IServiceCollection services)
    {
        services.AddControllers().AddApplicationPart(AssemblyReference.Assembly);
        return services;
    }
}
