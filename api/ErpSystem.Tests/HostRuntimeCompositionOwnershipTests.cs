using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.HR;
using ErpSystem.Modules.HR.Infrastructure.Common.Settings;
using ErpSystem.Modules.HR.Infrastructure.Hangfire.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace ErpSystem.Tests;

public sealed class HostRuntimeCompositionOwnershipTests
{
    [Fact]
    public void HrModule_NoLongerOwnsGenericRuntimeMiddlewareOrEndpointLifecycle()
    {
        Assert.Null(typeof(HRModule).GetMethod(nameof(IModule.ConfigureApplication)));
        Assert.Null(typeof(HRModule).GetMethod(nameof(IModule.MapEndpoints)));

        Assert.Equal("/hangfire", LegacyHangfireDashboardRuntimeContributor.DashboardPath);
        Assert.Equal("/hubs/company", LegacyCompanyRealtimeEndpointContributor.HubPath);
        Assert.Equal("AllowReactApp", LegacyCompanyRealtimeEndpointContributor.CorsPolicy);
    }

    [Fact]
    public void LegacyHangfireAdapter_PreservesDashboardAuthorizationAndOptions()
    {
        var filter = new HangfireAuthorizationFilter(Options.Create(new HangfireSettings
        {
            AllowedHosts = ["localhost"]
        }));

        var options = LegacyHangfireDashboardRuntimeContributor.CreateOptions(filter);

        Assert.Same(filter, Assert.Single(options.Authorization));
        Assert.Null(options.AppPath);
        Assert.False(options.DisplayStorageConnectionString);
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

    [Fact]
    public async Task LegacyProtectedFileStorageStartupTask_MigratesPublicLegacyFileIntoProtectedRoot()
    {
        var root = Path.Combine(Path.GetTempPath(), $"erp-runtime-{Guid.NewGuid():N}");
        var webRoot = Path.Combine(root, "wwwroot");
        var legacyUploads = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(legacyUploads);
        var legacyFile = Path.Combine(legacyUploads, "legacy.txt");
        await File.WriteAllTextAsync(legacyFile, "legacy-content");

        try
        {
            var environment = new TestWebHostEnvironment(root, webRoot);
            var task = new LegacyProtectedFileStorageStartupTask(environment);

            await task.ExecuteAsync();

            var protectedFile = Path.Combine(
                root,
                "App_Data",
                "ProtectedFiles",
                "uploads",
                "legacy.txt");
            Assert.False(File.Exists(legacyFile));
            Assert.True(File.Exists(protectedFile));
            Assert.Equal("legacy-content", await File.ReadAllTextAsync(protectedFile));
        }
        finally
        {
            if (Directory.Exists(root))
                Directory.Delete(root, recursive: true);
        }
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

    private sealed class TestWebHostEnvironment(string contentRoot, string webRoot) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "ErpSystem.Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = webRoot;
        public string EnvironmentName { get; set; } = "Testing";
        public string ContentRootPath { get; set; } = contentRoot;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
