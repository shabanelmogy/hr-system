using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;

namespace ErpSystem.Api.Hosting;

public static class HostRuntimeContributorExtensions
{
    /// <summary>
    /// Runs the host preflight and startup lifecycle before the server begins
    /// accepting requests. Explicitly invoking the options startup validator is
    /// important because this application performs migrations and startup tasks
    /// before <c>WebApplication.RunAsync</c>; relying only on ValidateOnStart
    /// would otherwise allow those side effects to run before invalid
    /// configuration is rejected by the host.
    /// </summary>
    public static async Task PrepareHostRuntimeAsync(
        this WebApplication app,
        ModuleCatalog catalog,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(app);
        ArgumentNullException.ThrowIfNull(catalog);

        app.ValidateHostStartupConfiguration();
        catalog.ValidateMigrationConfiguration(
            app.Services.GetRequiredService<IConfiguration>());
        await catalog.MigrateAsync(app.Services, cancellationToken).ConfigureAwait(false);
        await catalog.EnsureSchemaCompatibilityAsync(app.Services, cancellationToken).ConfigureAwait(false);
        await app.RunHostRuntimeStartupTasksAsync(cancellationToken).ConfigureAwait(false);
        await catalog.InitializeAsync(app, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Executes every options validation registered with ValidateOnStart before
    /// any migration or startup task can mutate external state.
    /// </summary>
    public static void ValidateHostStartupConfiguration(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);
        app.Services.GetService<IStartupValidator>()?.Validate();
    }

    public static async Task RunHostRuntimeStartupTasksAsync(
        this WebApplication app,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(app);

        await using var scope = app.Services.CreateAsyncScope();
        foreach (var task in scope.ServiceProvider.GetServices<IHostRuntimeStartupTask>())
        {
            cancellationToken.ThrowIfCancellationRequested();
            await task.ExecuteAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    public static void ConfigureHostRuntimeContributors(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        foreach (var contributor in app.Services.GetServices<IHostRuntimeApplicationContributor>())
            contributor.ConfigureApplication(app);
    }

    public static void MapHostRuntimeEndpoints(this IEndpointRouteBuilder endpoints)
    {
        ArgumentNullException.ThrowIfNull(endpoints);

        foreach (var contributor in endpoints.ServiceProvider.GetServices<IHostRuntimeEndpointContributor>())
            contributor.MapEndpoints(endpoints);
    }
}
