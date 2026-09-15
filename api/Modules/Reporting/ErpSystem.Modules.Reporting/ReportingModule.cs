using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Reporting.Application;
using ErpSystem.Modules.Reporting.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Presentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Reporting;

/// <summary>Bootstrap composition root for the Reporting bounded context.</summary>
public sealed class ReportingModule : IModule
{
    public string Name => "Reporting";
    public ModuleDefinition Definition => new("reporting", "Reporting", [new SubmoduleDefinition("analytics", "Analytics", ReportingPermissions.Reports)])
    {
        Version = "1.0.0"
    };

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddReportingApplication();
        services.AddReportingInfrastructure(configuration);
        services.AddReportingPresentation();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server schema bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// </summary>
    internal static string EnsureSchemaSql =>
        $"IF SCHEMA_ID(N'{ReportingDbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{ReportingDbContext.Schema}]');";

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ReportingDbContext>();

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
        var db = scope.ServiceProvider.GetRequiredService<ReportingDbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }
}