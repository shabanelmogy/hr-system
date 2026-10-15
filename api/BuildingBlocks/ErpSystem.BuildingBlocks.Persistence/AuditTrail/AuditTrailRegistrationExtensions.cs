using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.BuildingBlocks.Persistence.AuditTrail;

public static class AuditTrailRegistrationExtensions
{
    /// <summary>
    /// Adds the automatic audit-trail interceptor to a module DbContext. Use the
    /// <c>AddDbContext((provider, options) =&gt; ...)</c> overload so the interceptor
    /// sees the current request's user, tenant and correlation id.
    /// </summary>
    public static DbContextOptionsBuilder UseErpAuditTrail(
        this DbContextOptionsBuilder options,
        IServiceProvider serviceProvider,
        string moduleCode)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(serviceProvider);

        return options.AddInterceptors(new AuditTrailSaveChangesInterceptor(
            moduleCode,
            serviceProvider.GetService<ICurrentExecutionContext>(),
            serviceProvider.GetService<TimeProvider>() ?? TimeProvider.System));
    }

    /// <summary>Publishes the module's audit-trail table to the Platform Audit Trail screen.</summary>
    public static IServiceCollection AddErpAuditTrailSource<TContext>(
        this IServiceCollection services,
        string moduleCode)
        where TContext : DbContext
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentException.ThrowIfNullOrWhiteSpace(moduleCode);

        services.AddScoped<IAuditTrailSource>(provider =>
            new AuditTrailSource<TContext>(provider.GetRequiredService<TContext>(), moduleCode));
        return services;
    }
}
