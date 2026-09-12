using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace ErpSystem.BuildingBlocks.Modularity;

/// <summary>
/// Host-owned runtime middleware contribution from an installed module.
/// Implementations should be thin composition adapters; business behavior stays
/// behind the module's normal application/infrastructure boundaries.
/// </summary>
public interface IHostRuntimeApplicationContributor
{
    void ConfigureApplication(WebApplication app);
}

/// <summary>
/// Host-owned endpoint contribution from an installed module. This is intended
/// for technical endpoints such as realtime hubs that do not belong to a
/// business module's public API surface.
/// </summary>
public interface IHostRuntimeEndpointContributor
{
    void MapEndpoints(IEndpointRouteBuilder endpoints);
}

/// <summary>
/// Startup work that is part of the shared host/platform runtime rather than a
/// business module lifecycle. Tasks are resolved inside a host-created scope and
/// execute in deterministic DI registration order after migrations complete.
/// </summary>
public interface IHostRuntimeStartupTask
{
    Task ExecuteAsync(CancellationToken cancellationToken = default);
}
