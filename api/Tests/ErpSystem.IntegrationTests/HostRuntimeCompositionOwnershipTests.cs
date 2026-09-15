using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure.Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace ErpSystem.IntegrationTests;

public sealed class HostRuntimeCompositionOwnershipTests
{
    [Fact]
    public void PlatformModule_OwnsGenericRuntimeContributorsAndHrDoesNot()
    {
        Assert.Null(typeof(HRModule).GetMethod(nameof(IModule.ConfigureApplication)));
        Assert.Null(typeof(HRModule).GetMethod(nameof(IModule.MapEndpoints)));

        Assert.Equal("/hangfire", PlatformHangfireSettings.DashboardPath);

        var platformAssembly = typeof(PlatformModule).Assembly;
        var hangfireContributor = platformAssembly.GetType(
            "ErpSystem.Modules.Platform.PlatformHangfireDashboardRuntimeContributor",
            throwOnError: true)!;
        var realtimeContributor = platformAssembly.GetType(
            "ErpSystem.Modules.Platform.PlatformRealtimeEndpointContributor",
            throwOnError: true)!;

        Assert.True(typeof(IHostRuntimeApplicationContributor).IsAssignableFrom(hangfireContributor));
        Assert.True(typeof(IHostRuntimeEndpointContributor).IsAssignableFrom(realtimeContributor));
        Assert.Null(platformAssembly.GetType("ErpSystem.Modules.Platform.LegacyHangfireDashboardRuntimeContributor"));
        Assert.Null(platformAssembly.GetType("ErpSystem.Modules.Platform.LegacyCompanyRealtimeEndpointContributor"));
    }

    [Fact]
    public void PlatformHangfireAuthorization_RequiresPermissionAndAllowedHost()
    {
        var filter = new PlatformHangfireAuthorizationFilter(Options.Create(new PlatformHangfireSettings
        {
            AllowedHosts = ["localhost"]
        }));
        var context = new DefaultHttpContext();
        context.Request.Host = new HostString("localhost");
        context.Request.Path = PlatformHangfireSettings.DashboardPath;
        context.User = new System.Security.Claims.ClaimsPrincipal(
            new System.Security.Claims.ClaimsIdentity(
            [new System.Security.Claims.Claim(PermissionClaimNames.Permission, PlatformPermissions.ViewHangfireDashboard)],
            "test"));

        Assert.True(filter.Authorize(context));

        context.Request.Host = new HostString("untrusted.example");
        Assert.False(filter.Authorize(context));
    }

    [Fact]
    public async Task HostRuntimeExtensions_ExecuteContributorsAndScopedStartupTasksInRegistrationOrder()
    {
        var log = new List<string>();
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddSingleton(log);
        builder.Services.AddSingleton<IHostRuntimeApplicationContributor, RecordingApplicationContributor>();
        builder.Services.AddSingleton<IHostRuntimeEndpointContributor, RecordingEndpointContributor>();
        builder.Services.AddScoped<IHostRuntimeStartupTask, FirstStartupTask>();
        builder.Services.AddScoped<IHostRuntimeStartupTask, SecondStartupTask>();

        await using var app = builder.Build();

        await app.RunHostRuntimeStartupTasksAsync();
        app.ConfigureHostRuntimeContributors();
        app.MapHostRuntimeEndpoints();

        Assert.Equal(["startup:first", "startup:second", "application", "endpoint"], log);
    }

    [Fact]
    public async Task PrepareHostRuntimeAsync_ValidatesConfigurationBeforeMigrationsOrStartupSideEffects()
    {
        var log = new List<string>();
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddSingleton(log);
        builder.Services.AddOptions<InvalidStartupSettings>()
            .Configure(settings => settings.Value = "invalid")
            .Validate(settings => settings.Value == "valid", "Value must be valid.")
            .ValidateOnStart();
        builder.Services.AddScoped<IHostRuntimeStartupTask, FirstStartupTask>();

        var module = new RecordingModule(log);
        var catalog = new ModuleCatalog([module]);
        await using var app = builder.Build();

        await Assert.ThrowsAsync<OptionsValidationException>(() =>
            app.PrepareHostRuntimeAsync(catalog));

        Assert.Empty(log);
    }

    [Fact]
    public async Task PrepareHostRuntimeAsync_RunsMigrationStartupTasksThenModuleInitialization()
    {
        var log = new List<string>();
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddSingleton(log);
        builder.Services.AddOptions<InvalidStartupSettings>()
            .Configure(settings => settings.Value = "valid")
            .Validate(settings => settings.Value == "valid")
            .ValidateOnStart();
        builder.Services.AddScoped<IHostRuntimeStartupTask, FirstStartupTask>();

        var module = new RecordingModule(log);
        var catalog = new ModuleCatalog([module]);
        await using var app = builder.Build();

        await app.PrepareHostRuntimeAsync(catalog);

        Assert.Equal(["migrate", "schema", "startup:first", "initialize"], log);
    }

    [Fact]
    public async Task PrepareHostRuntimeAsync_BlocksStartupWritesWhenSchemaIsIncompatible()
    {
        var log = new List<string>();
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddSingleton(log);
        builder.Services.AddScoped<IHostRuntimeStartupTask, FirstStartupTask>();

        var module = new RecordingModule(log, pendingMigrations: ["202609110001_BreakingChange"]);
        var catalog = new ModuleCatalog([module]);
        await using var app = builder.Build();

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            app.PrepareHostRuntimeAsync(catalog));

        Assert.Contains("Recording", exception.Message);
        Assert.Contains("202609110001_BreakingChange", exception.Message);
        Assert.Equal(["migrate", "schema"], log);
    }

    [Fact]
    public async Task PrepareHostRuntimeAsync_ValidatesEveryModuleMigrationSwitchBeforeAnyMigrationRuns()
    {
        var log = new List<string>();
        var builder = WebApplication.CreateBuilder();
        builder.Configuration["DatabaseSettings:ApplyMigrationsOnStartup"] = "true";
        builder.Configuration["Modules:Second:Database:ApplyMigrationsOnStartup"] = "sometimes";

        var catalog = new ModuleCatalog([
            new RecordingModule(log, "First"),
            new RecordingModule(log, "Second")
        ]);
        await using var app = builder.Build();

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            app.PrepareHostRuntimeAsync(catalog));

        Assert.Contains("Modules:Second:Database:ApplyMigrationsOnStartup", exception.Message);
        Assert.Empty(log);
    }

    private sealed class RecordingApplicationContributor(List<string> log)
        : IHostRuntimeApplicationContributor
    {
        public void ConfigureApplication(WebApplication app) => log.Add("application");
    }

    private sealed class RecordingEndpointContributor(List<string> log)
        : IHostRuntimeEndpointContributor
    {
        public void MapEndpoints(IEndpointRouteBuilder endpoints) => log.Add("endpoint");
    }

    private sealed class FirstStartupTask(List<string> log) : IHostRuntimeStartupTask
    {
        public Task ExecuteAsync(CancellationToken cancellationToken = default)
        {
            log.Add("startup:first");
            return Task.CompletedTask;
        }
    }

    private sealed class SecondStartupTask(List<string> log) : IHostRuntimeStartupTask
    {
        public Task ExecuteAsync(CancellationToken cancellationToken = default)
        {
            log.Add("startup:second");
            return Task.CompletedTask;
        }
    }

    private sealed class InvalidStartupSettings
    {
        public string Value { get; set; } = string.Empty;
    }

    private sealed class RecordingModule(
        List<string> log,
        string name = "Recording",
        IReadOnlyList<string>? pendingMigrations = null) : IModule
    {
        public string Name { get; } = name;

        public ModuleDefinition Definition => new(Name.ToLowerInvariant(), Name, []);

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
        }

        public Task MigrateAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            log.Add("migrate");
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            log.Add("schema");
            return Task.FromResult(pendingMigrations ?? (IReadOnlyList<string>)[]);
        }

        public Task InitializeAsync(
            WebApplication app,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            log.Add("initialize");
            return Task.CompletedTask;
        }
    }

}

