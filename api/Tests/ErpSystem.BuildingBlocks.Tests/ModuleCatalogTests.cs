using ErpSystem.BuildingBlocks.Modularity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class ModuleCatalogTests
{
    [Fact]
    public void Constructor_RejectsNullSourceNullModulesDuplicateNamesAndInvalidNames()
    {
        Assert.Throws<ArgumentNullException>(() => new ModuleCatalog(null!));
        Assert.Throws<ArgumentException>(() =>
            new ModuleCatalog([new StubModule("Accounting"), null!]));
        Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([new StubModule("Accounting"), new StubModule("accounting")]));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new StubModule("Bad Name")]));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new StubModule("1Accounting")]));
    }

    [Fact]
    public void Constructor_MaterializesSourceOnceAndPreservesRegistrationOrder()
    {
        var catalog = new ModuleCatalog(new SingleUseEnumerable<IModule>(
            [new StubModule("B"), new StubModule("A")]));

        Assert.Equal(["B", "A"], catalog.Modules.Select(module => module.Name));
        Assert.Equal(["B", "A"], catalog.LifecycleModules.Select(module => module.Name));
    }

    [Fact]
    public void Constructor_RejectsInvalidStableVersion()
    {
        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([
                new StubModule("Accounting", definition: new ModuleDefinition("acc", "Accounting", [])
                {
                    Version = "1.0"
                })
            ]));

        Assert.Contains("invalid version", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Constructor_ValidatesRequiredAndOptionalDependencies()
    {
        var missing = Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([
                new StubModule("Sales", definition: Definition("sales", "Sales", required: ["inventory"]))
            ]));
        Assert.Contains("missing required module dependencies", missing.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("inventory", missing.Message, StringComparison.Ordinal);

        var optional = new ModuleCatalog([
            new StubModule("Sales", definition: Definition("sales", "Sales", optional: ["inventory"]))
        ]);
        Assert.Equal(["Sales"], optional.LifecycleModules.Select(module => module.Name));
    }

    [Fact]
    public void Constructor_RejectsCyclesIncludingInstalledOptionalEdges()
    {
        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([
                new StubModule("Sales", definition: Definition("sales", "Sales", required: ["inventory"])),
                new StubModule("Inventory", definition: Definition("inventory", "Inventory", optional: ["sales"]))
            ]));

        Assert.Contains("cycle", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("sales", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("inventory", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Constructor_SeparatesTechnicalLifecycleFromTenantAndUserCatalogs()
    {
        var platform = new ModuleDefinition("platform", "Platform", [])
        {
            IsUserVisible = false,
            AllowsTenantEntitlement = false
        };
        var hr = new ModuleDefinition("hr", "HR", [], IsDefault: true)
        {
            RequiredModuleDependencies = ["platform"]
        };
        var catalog = new ModuleCatalog([
            new StubModule("HR", definition: hr),
            new StubModule("Platform", definition: platform)
        ]);

        Assert.Equal(["Platform", "HR"], catalog.LifecycleModules.Select(module => module.Name));
        Assert.Equal(["hr"], catalog.UserVisibleDefinitions.Select(definition => definition.Code));
        Assert.Equal(["hr"], catalog.TenantEntitlementDefinitions.Select(definition => definition.Code));
    }

    [Fact]
    public void Constructor_RejectsDefaultModuleThatCannotBeTenantEntitled()
    {
        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([
                new StubModule("Technical", definition: new ModuleDefinition("technical", "Technical", [], IsDefault: true)
                {
                    AllowsTenantEntitlement = false,
                    IsUserVisible = false
                })
            ]));

        Assert.Contains("default tenant entitlement", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Lifecycle_UsesStableDependencyAwareOrderAcrossEveryPhase()
    {
        var log = new List<string>();
        var catalog = new ModuleCatalog([
            new StubModule("Sales", log, Definition("sales", "Sales", required: ["inventory"])),
            new StubModule("Inventory", log, Definition("inventory", "Inventory")),
            new StubModule("Reporting", log, Definition("reporting", "Reporting"))
        ]);
        using var services = new ServiceCollection().BuildServiceProvider();
        var endpoints = new StubEndpoints();
        await using var app = WebApplication.CreateBuilder().Build();

        Assert.Equal(["Sales", "Inventory", "Reporting"], catalog.Modules.Select(module => module.Name));
        Assert.Equal(["Inventory", "Sales", "Reporting"], catalog.LifecycleModules.Select(module => module.Name));

        catalog.RegisterServices(new ServiceCollection(), new ConfigurationBuilder().Build());
        catalog.ConfigureEarlyApplication(app);
        catalog.MapEndpoints(endpoints);
        await catalog.MigrateAsync(services);
        catalog.ConfigureApplication(app);
        await catalog.InitializeAsync(app);

        Assert.Equal(
            [
                "register:Inventory", "register:Sales", "register:Reporting",
                "early:Inventory", "early:Sales", "early:Reporting",
                "map:Inventory", "map:Sales", "map:Reporting",
                "migrate:Inventory", "migrate:Sales", "migrate:Reporting",
                "configure:Inventory", "configure:Sales", "configure:Reporting",
                "initialize:Inventory", "initialize:Sales", "initialize:Reporting"
            ],
            log);
    }

    [Fact]
    public async Task Lifecycle_PreservesRegistrationOrderWhenThereAreNoDependencies()
    {
        var log = new List<string>();
        var catalog = new ModuleCatalog([new StubModule("First", log), new StubModule("Second", log)]);
        using var services = new ServiceCollection().BuildServiceProvider();
        var endpoints = new StubEndpoints();
        await using var app = WebApplication.CreateBuilder().Build();

        catalog.RegisterServices(new ServiceCollection(), new ConfigurationBuilder().Build());
        catalog.ConfigureEarlyApplication(app);
        catalog.MapEndpoints(endpoints);
        await catalog.MigrateAsync(services);
        catalog.ConfigureApplication(app);
        await catalog.InitializeAsync(app);

        Assert.Equal(
            [
                "register:First", "register:Second", "early:First", "early:Second",
                "map:First", "map:Second", "migrate:First", "migrate:Second",
                "configure:First", "configure:Second", "initialize:First", "initialize:Second"
            ],
            log);
    }

    [Fact]
    public void AddModules_RegistersTheCatalogAsSingleton()
    {
        var services = new ServiceCollection();
        services.AddModules(new ConfigurationBuilder().Build(), new StubModule("X"));
        using var provider = services.BuildServiceProvider();

        var first = provider.GetRequiredService<ModuleCatalog>();
        var second = provider.GetRequiredService<ModuleCatalog>();
        Assert.Same(first, second);
    }

    private static ModuleDefinition Definition(
        string code,
        string name,
        IReadOnlyList<string>? required = null,
        IReadOnlyList<string>? optional = null) =>
        new(code, name, [])
        {
            Version = "1.0.0",
            RequiredModuleDependencies = required ?? [],
            OptionalModuleDependencies = optional ?? []
        };

    private sealed class StubModule(
        string name,
        List<string>? log = null,
        ModuleDefinition? definition = null) : IModule
    {
        public string Name { get; } = name;
        public ModuleDefinition Definition { get; } = definition ?? new(name.ToLowerInvariant(), name, []);

        public void RegisterServices(IServiceCollection services, IConfiguration configuration) =>
            log?.Add($"register:{Name}");

        public void MapEndpoints(IEndpointRouteBuilder endpoints) => log?.Add($"map:{Name}");

        public void ConfigureEarlyApplication(WebApplication app) => log?.Add($"early:{Name}");

        public Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
        {
            log?.Add($"migrate:{Name}");
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<string>>([]);

        public void ConfigureApplication(WebApplication app) => log?.Add($"configure:{Name}");

        public Task InitializeAsync(WebApplication app, CancellationToken cancellationToken = default)
        {
            log?.Add($"initialize:{Name}");
            return Task.CompletedTask;
        }
    }

    private sealed class SingleUseEnumerable<T>(IEnumerable<T> items) : IEnumerable<T>
    {
        private int _enumerations;

        public IEnumerator<T> GetEnumerator()
        {
            if (Interlocked.Exchange(ref _enumerations, 1) != 0)
                throw new InvalidOperationException("Source enumerable was enumerated more than once.");

            return items.GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
    }

    private sealed class StubEndpoints : IEndpointRouteBuilder
    {
        public IServiceProvider ServiceProvider { get; } = new ServiceCollection().BuildServiceProvider();
        public ICollection<EndpointDataSource> DataSources { get; } = [];
        public IApplicationBuilder CreateApplicationBuilder() => new ApplicationBuilder(ServiceProvider);
    }
}
