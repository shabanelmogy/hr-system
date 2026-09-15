using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.CRM.Application;
using ErpSystem.Modules.CRM.Contracts.Authorization;
using ErpSystem.Modules.CRM.Infrastructure;
using ErpSystem.Modules.CRM.Presentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.CRM;

/// <summary>Bootstrap composition root for the CRM bounded context.</summary>
public sealed class CrmModule : IModule
{
    public string Name => "CRM";
    public ModuleDefinition Definition => new(
        "crm",
        "CRM",
        [new SubmoduleDefinition("appointments", "Appointments", CrmPermissions.Appointments)])
    {
        Version = "1.0.0"
    };

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddCrmApplication();
        services.AddCrmInfrastructure(configuration);
        services.AddCrmPresentation();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server schema bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// </summary>
    internal static string EnsureSchemaSql =>
        $"IF SCHEMA_ID(N'{CrmDbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{CrmDbContext.Schema}]');";

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<CrmDbContext>();

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
        var db = scope.ServiceProvider.GetRequiredService<CrmDbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }
}
