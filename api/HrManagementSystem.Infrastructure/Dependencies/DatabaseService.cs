using HrManagementSystem.Application.Abstractions.Persistence;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class DatabaseService
{
    public static IServiceCollection AddDatabaseservice(this IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("DefaultConnection") ??
               throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped<IUnitOfWork>(serviceProvider =>
            serviceProvider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ICategoryValidationQueries>(GetValidationQueries);
        services.AddScoped<ISubCategoryValidationQueries>(GetValidationQueries);
        services.AddScoped<IReportValidationQueries>(GetValidationQueries);
        services.AddScoped<ICountryValidationQueries>(GetValidationQueries);
        services.AddScoped<IStateValidationQueries>(GetValidationQueries);
        services.AddScoped<IDistrictValidationQueries>(GetValidationQueries);
        services.AddScoped<IAddressTypeValidationQueries>(GetValidationQueries);
        services.AddScoped<IUserValidationQueries>(GetValidationQueries);
        services.AddScoped<IRoleValidationQueries>(GetValidationQueries);

        return services;
    }

    private static ApplicationDbContext GetValidationQueries(IServiceProvider serviceProvider) =>
        serviceProvider.GetRequiredService<ApplicationDbContext>();
}
