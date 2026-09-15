using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.Categories.Errors;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Abstractions;
using ErpSystem.Modules.Inventory.Application.Features.Catalog.SubCategories.Errors;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.Categories.Persistence;
using ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog.SubCategories.Persistence;

namespace ErpSystem.Modules.Inventory.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInventoryInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Inventory")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'Inventory' or 'DefaultConnection' not found.");

        services.AddDbContext<InventoryDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", InventoryDbContext.Schema)));
        services.AddScoped<CategoryErrors>();
        services.AddScoped<SubCategoryErrors>();
        services.AddScoped<ICategoryReadStore, CategoryReadStore>();
        services.AddScoped<ICategoryWriteStore, CategoryWriteStore>();
        services.AddScoped<ICategoryEffects, CategoryEffects>();
        services.AddScoped<ISubCategoryReadStore, SubCategoryReadStore>();
        services.AddScoped<ISubCategoryWriteStore, SubCategoryWriteStore>();
        services.AddScoped<ISubCategoryEffects, SubCategoryEffects>();
        services.AddScoped<ICategoryValidationQueries, CategoryValidationQueries>();
        services.AddScoped<ISubCategoryValidationQueries, SubCategoryValidationQueries>();

        return services;
    }
}
