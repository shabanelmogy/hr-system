namespace HrManagementSystem.Infrastructure.Dependencies;

public static class DatabaseService
{
    public static IServiceCollection AddDatabaseservice(this IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("DefaultConnection") ??
               throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));

        return services;
    }
}
