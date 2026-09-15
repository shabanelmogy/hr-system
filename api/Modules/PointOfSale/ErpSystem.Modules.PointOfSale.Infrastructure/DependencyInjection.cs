using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

        services.AddDbContext<PointOfSaleDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", PointOfSaleDbContext.Schema)));

        return services;
    }
}