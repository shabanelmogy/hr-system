using System.Runtime.CompilerServices;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Accounting.Application;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Presentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

[assembly: InternalsVisibleTo("ErpSystem.Tests")]

namespace ErpSystem.Modules.Accounting;

/// <summary>Bootstrap composition root for the Accounting bounded context.</summary>
public sealed class AccountingModule : IModule
{
    public string Name => "Accounting";
    public ModuleDefinition Definition => new("acc", "Accounting", [])
    {
        Version = "1.0.0",
        OptionalModuleDependencies = ["contacts"]
    };

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddAccountingApplication();
        services.AddAccountingInfrastructure(configuration);
        services.AddAccountingPresentation();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server schema bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// Exposed statically so the exact statement is unit-testable without a database.
    /// </summary>
    internal static string EnsureSchemaSql =>
        $"IF SCHEMA_ID(N'{AccountingDbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{AccountingDbContext.Schema}]');";

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();

        // EF creates the module history table before running the first migration;
        // the module schema must exist first or that CREATE TABLE fails.
        // Ensure the schema before inspecting migrations so a fresh module can
        // exist and apply its first migration.
        await db.Database.ExecuteSqlRawAsync(EnsureSchemaSql, cancellationToken).ConfigureAwait(false);

        // The initial empty-model migration (InitializeAccountingSchema) exists
        // so the module history table can be created; skip only when the
        // assembly defines no migrations at all. GetMigrations() reads the
        // assembly only, without touching the database.
        if (!db.Database.GetMigrations().Any())
            return;

        await db.Database.MigrateAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }
}
