using ErpSystem.Modules.HR.Application.Abstractions.Persistence;
using ErpSystem.Modules.HR.Application.Abstractions.Validation;
using Scrutor;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class DatabaseService
{
    public static IServiceCollection AddDatabaseservice(this IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("HR")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'HR' or 'DefaultConnection' not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ApplicationDbContext.Schema)));
        services.AddOptions<DatabaseSettings>()
            .BindConfiguration(DatabaseSettings.SectionName)
            .ValidateOnStart();
        services.AddScoped<IUnitOfWork>(serviceProvider =>
            serviceProvider.GetRequiredService<ApplicationDbContext>());
        services.Scan(scan => scan
            .FromAssemblyOf<ApplicationDbContext>()
            .AddClasses(classes => classes.AssignableTo<IValidationQuery>())
            .UsingRegistrationStrategy(RegistrationStrategy.Skip)
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
