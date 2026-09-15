using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Inventory.Application;
using ErpSystem.Modules.Inventory.Contracts.Authorization;
using ErpSystem.Modules.Inventory.Infrastructure;
using ErpSystem.Modules.Inventory.Presentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Inventory;

/// <summary>Bootstrap composition root for the Inventory bounded context.</summary>
public sealed class InventoryModule : IModule
{
    public string Name => "Inventory";
    public ModuleDefinition Definition => new("inventory", "Inventory", [new SubmoduleDefinition("catalog", "Catalog", InventoryPermissions.Catalog)])
    {
        Version = "1.0.0"
    };

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddInventoryApplication();
        services.AddInventoryInfrastructure(configuration);
        services.AddInventoryPresentation();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server schema bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// </summary>
    internal static string EnsureSchemaSql =>
        $"IF SCHEMA_ID(N'{InventoryDbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{InventoryDbContext.Schema}]');";

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();

        // EF creates the module history table before running the first migration;
        // the module schema must exist first or that CREATE TABLE fails.
        // Ensure the schema before inspecting migrations so a fresh module can
        // exist and apply its first migration.
        await db.Database.ExecuteSqlRawAsync(EnsureSchemaSql, cancellationToken).ConfigureAwait(false);

        // No migrations are defined for a fresh module yet. GetMigrations() reads
        // the assembly only, so there is nothing further to apply until the
        // first real migration exists.
        if (!db.Database.GetMigrations().Any())
            return;

        await db.Database.MigrateAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }
}