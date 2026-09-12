using System.Runtime.CompilerServices;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR.Application;
using ErpSystem.Modules.HR.Infrastructure;
using ErpSystem.Modules.HR.Infrastructure.Common.Observability;
using ErpSystem.Modules.HR.Infrastructure.Common.Settings;
using ErpSystem.Modules.HR.Infrastructure.Localization;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence.Seeds;
using ErpSystem.Modules.HR.Presentation;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

[assembly: InternalsVisibleTo("ErpSystem.Tests")]

namespace ErpSystem.Modules.HR;

/// <summary>Composition root for the complete HR module.</summary>
public sealed class HRModule : IModule
{
    public string Name => "HR";
    public ModuleDefinition Definition => HrModuleDefinition.Create();

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddApplication();
        services.AddInfrastructure(configuration);
        services.AddHRPresentation();
        services.AddSingleton<IHostRuntimeApplicationContributor, LegacyHangfireDashboardRuntimeContributor>();
        services.AddSingleton<IHostRuntimeEndpointContributor, LegacyCompanyRealtimeEndpointContributor>();
        services.AddSingleton<IHostRuntimeStartupTask, LegacyProtectedFileStorageStartupTask>();
        services.AddScoped<IHostRuntimeStartupTask, LegacySystemRolePermissionStartupTask>();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// Creates the hr schema when missing. Exposed statically so the exact
    /// statement is unit-testable without a database.
    /// </summary>
    internal static string EnsureSchemaSql =>
        $"IF SCHEMA_ID(N'{ApplicationDbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{ApplicationDbContext.Schema}]');";

    /// <summary>
    /// Moves the legacy dbo EF migrations history into the hr schema. Runs only
    /// when the hr history is absent and the dbo history exists, so it is a
    /// no-op on fresh databases and on already-moved databases.
    /// </summary>
    internal static string MoveHistoryToModuleSchemaSql =>
        $"IF OBJECT_ID(N'[{ApplicationDbContext.Schema}].[__EFMigrationsHistory]', N'U') IS NULL " +
        "AND OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NOT NULL " +
        $"EXEC(N'ALTER SCHEMA [{ApplicationDbContext.Schema}] TRANSFER [dbo].[__EFMigrationsHistory];');";

    public async Task MigrateAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        // Fresh databases need the schema before EF creates hr.__EFMigrationsHistory.
        await db.Database.ExecuteSqlRawAsync(EnsureSchemaSql, cancellationToken).ConfigureAwait(false);
        // Existing databases created before the hr schema keep their applied
        // migrations in dbo.__EFMigrationsHistory; move that single history
        // table so subsequent MigrateAsync calls resume from hr history.
        await db.Database.ExecuteSqlRawAsync(MoveHistoryToModuleSchemaSql, cancellationToken).ConfigureAwait(false);
        await db.Database.MigrateAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }

    public async Task InitializeAsync(
        WebApplication app,
        CancellationToken cancellationToken = default)
    {
        var settings = app.Services.GetRequiredService<IOptions<DatabaseSettings>>().Value;
        if (settings.SeedOnStartup)
            await app.AddSeedsRequest().WaitAsync(cancellationToken).ConfigureAwait(false);
    }
}
