using ErpSystem.Modules.HR.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Application.Abstractions.Validation;
using Scrutor;
using ErpSystem.BuildingBlocks.Persistence.AuditTrail;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class DatabaseService
{
    public static IServiceCollection AddDatabaseservice(this IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("HR")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'HR' or 'DefaultConnection' not found.");

        services.AddDbContext<HrDbContext>((provider, options) =>
            options.UseErpAuditTrail(provider, "hr").UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(HrDbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", HrDbContext.Schema)));
        services.AddErpAuditTrailSource<HrDbContext>("hr");
        services.AddOptions<DatabaseSettings>()
            .BindConfiguration(DatabaseSettings.SectionName)
            .ValidateOnStart();
        services.AddScoped<IHrUnitOfWork>(serviceProvider =>
            serviceProvider.GetRequiredService<HrDbContext>());
        services.Scan(scan => scan
            .FromAssemblyOf<HrDbContext>()
            .AddClasses(classes => classes.AssignableTo<IValidationQuery>())
            .UsingRegistrationStrategy(RegistrationStrategy.Skip)
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
