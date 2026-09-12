using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.BuildingBlocks.Modularity;

/// <summary>
/// Composition contract for a business module in the modular monolith.
/// The host registers, migrates, and maps modules explicitly; no reflection scanning.
/// </summary>
public interface IModule
{
    /// <summary>Unique module name. Compared case-insensitively.</summary>
    string Name { get; }

    /// <summary>Stable module/submodule catalog entry used for licensing and navigation.</summary>
    ModuleDefinition Definition => new(Name.ToLowerInvariant(), Name, []);

    /// <summary>Register module services into the shared host container.</summary>
    void RegisterServices(IServiceCollection services, IConfiguration configuration);

    /// <summary>
    /// Map module endpoints into the shared HTTP pipeline. Default is a no-op so
    /// modules without minimal-API endpoints (controller-only modules) do not
    /// need an override.
    /// </summary>
    void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
    }

    /// <summary>
    /// Run module-owned migrations. Must be safe to call on every startup and
    /// must only touch storage owned by the module.
    /// </summary>
    Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns migrations that still need to be applied for this module's owned
    /// database. The host uses the result both during startup preflight and for
    /// readiness so startup write tasks never run against an incompatible schema.
    /// </summary>
    Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configure middleware that must run before host-owned request logging and
    /// transport middleware. Default is a no-op.
    /// </summary>
    void ConfigureEarlyApplication(WebApplication app)
    {
    }

    /// <summary>Configure module-owned middleware in the shared pipeline.</summary>
    void ConfigureApplication(WebApplication app)
    {
    }

    /// <summary>Run module-owned startup initialization after the host is built.</summary>
    Task InitializeAsync(WebApplication app, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
