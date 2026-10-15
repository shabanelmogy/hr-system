using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ErpSystem.BuildingBlocks.Persistence.AuditTrail;

namespace ErpSystem.Modules.PointOfSale.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddPointOfSaleInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PointOfSale")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'PointOfSale' or 'DefaultConnection' not found.");

        services.AddDbContext<PointOfSaleDbContext>((provider, options) =>
            options.UseErpAuditTrail(provider, "point-of-sale").UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", PointOfSaleDbContext.Schema)));
        services.AddErpAuditTrailSource<PointOfSaleDbContext>("point-of-sale");

        return services;
    }
}