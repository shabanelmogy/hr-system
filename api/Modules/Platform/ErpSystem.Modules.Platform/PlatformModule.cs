using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Presentation;
using ErpSystem.Modules.Platform.Presentation.Tenancy;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform;

/// <summary>Bootstrap composition root for the Platform bounded context.</summary>
public sealed class PlatformModule : IModule
{
    public string Name => "Platform";
    public ModuleDefinition Definition => new("platform", "Platform",
    [
        new SubmoduleDefinition(
            "tenant-administration",
            "Tenant administration",
            PlatformPermissions.TenantAdministration,
            PermissionAccessMode: PermissionAccessMode.Tenant),
        new SubmoduleDefinition(
            "operations",
            "Platform operations",
            PlatformPermissions.GlobalOperations,
            PermissionAccessMode: PermissionAccessMode.Global)
    ])
    {
        Version = "1.0.0",
        IsUserVisible = false,
        AllowsTenantEntitlement = false
    };

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddPlatformApplication();
        services.AddPlatformInfrastructure(configuration);
        services.AddPlatformPresentation();
        services.AddSingleton<IHostRuntimeApplicationContributor, PlatformHangfireDashboardRuntimeContributor>();
        services.AddSingleton<IHostRuntimeEndpointContributor, PlatformRealtimeEndpointContributor>();
    }

    public void ConfigureApplication(WebApplication app)
    {
        app.UseMiddleware<TenantReadOnlyMiddleware>();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server schema bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// </summary>
    internal static string EnsureSchemaSql =>
        $"IF SCHEMA_ID(N'{PlatformDbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{PlatformDbContext.Schema}]');";

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();

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
        var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }
}
