using System.Reflection;
using System.Runtime.CompilerServices;
using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Context.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class ModulePersistenceFoundationTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ModulesRoot = Path.Combine(ApiRoot, "Modules");

    [Fact]
    public void EveryModuleDbContext_ModelUsesItsDeclaredSchema()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            using var provider = BuildModuleProvider(contextType, ConfigurationWithDefaultConnection());
            using var scope = provider.CreateScope();
            var context = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);

            Assert.Equal(ModuleSchema(contextType), context.Model.GetDefaultSchema());
        }
    }

    [Fact]
    public void EveryModuleDbContext_UsesModuleConnectionBeforeDefaultFallback()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            var module = ModuleName(contextType);
            var moduleConnection = $"Server=(local);Database={module}Owned;Trusted_Connection=True;TrustServerCertificate=True";
            var defaultConnection = "Server=(local);Database=DefaultOwned;Trusted_Connection=True;TrustServerCertificate=True";

            var moduleFirst = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    [$"ConnectionStrings:{module}"] = moduleConnection,
                    ["ConnectionStrings:DefaultConnection"] = defaultConnection
                })
                .Build();
            Assert.Equal($"{module}Owned", RegisteredDatabaseName(contextType, moduleFirst));

            var fallbackOnly = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = defaultConnection
                })
                .Build();
            Assert.Equal("DefaultOwned", RegisteredDatabaseName(contextType, fallbackOnly));
        }
    }

    [Fact]
    public void EveryModuleDbContext_HasBaselineMigrationAndNoPendingModelChanges()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            using var provider = BuildModuleProvider(contextType, ConfigurationWithDefaultConnection());
            using var scope = provider.CreateScope();
            var context = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);
            var migrations = context.Database.GetMigrations().ToArray();

            Assert.NotEmpty(migrations);
            Assert.False(
                context.Database.HasPendingModelChanges(),
                $"{contextType.FullName} has model changes that are not represented by its migration snapshot.");
        }
    }

    private static string RegisteredDatabaseName(Type contextType, IConfiguration configuration)
    {
        using var provider = BuildModuleProvider(contextType, configuration);
        using var scope = provider.CreateScope();
        var context = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);
        return context.Database.GetDbConnection().Database;
    }

    private static ServiceProvider BuildModuleProvider(Type contextType, IConfiguration configuration)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHostSharedRuntime(configuration);

        var dependencyInjection = contextType.Assembly.GetType(
            $"ErpSystem.Modules.{ModuleName(contextType)}.Infrastructure.DependencyInjection");
        Assert.NotNull(dependencyInjection);
        var registration = dependencyInjection!.GetMethods(BindingFlags.Public | BindingFlags.Static)
            .Single(method =>
            {
                var parameters = method.GetParameters();
                return method.ReturnType == typeof(IServiceCollection)
                       && parameters.Length == 2
                       && parameters[0].ParameterType == typeof(IServiceCollection)
                       && parameters[1].ParameterType == typeof(IConfiguration);
            });
        registration.Invoke(null, [services, configuration]);

        services.AddScoped<ICurrentActor, TestActor>();
        services.AddSingleton(TimeProvider.System);
        return services.BuildServiceProvider();
    }

    private static IConfiguration ConfigurationWithDefaultConnection() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=FoundationModel;Trusted_Connection=True;TrustServerCertificate=True"
            })
            .Build();

    private static Type[] ModuleDbContexts() =>
        Directory.GetDirectories(ModulesRoot)
            .Select(Path.GetFileName)
            .OfType<string>()
            .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
            .Select(module => Assembly.Load($"ErpSystem.Modules.{module}.Infrastructure"))
            .SelectMany(assembly => assembly.GetTypes())
            .Where(type => !type.IsAbstract && typeof(DbContext).IsAssignableFrom(type))
            .OrderBy(type => type.FullName, StringComparer.Ordinal)
            .ToArray();

    private static string ModuleName(Type contextType)
    {
        const string prefix = "ErpSystem.Modules.";
        const string suffix = ".Infrastructure";
        var assemblyName = contextType.Assembly.GetName().Name
            ?? throw new InvalidOperationException($"Assembly name is missing for {contextType.FullName}.");
        Assert.StartsWith(prefix, assemblyName, StringComparison.Ordinal);
        Assert.EndsWith(suffix, assemblyName, StringComparison.Ordinal);
        return assemblyName[prefix.Length..^suffix.Length];
    }

    private static string ModuleSchema(Type contextType)
    {
        var field = contextType.GetField("Schema", BindingFlags.Public | BindingFlags.Static);
        return Assert.IsType<string>(field?.GetRawConstantValue());
    }

    private static string FindApiRoot([CallerFilePath] string sourcePath = "")
    {
        foreach (var start in new[] { Path.GetDirectoryName(sourcePath), Directory.GetCurrentDirectory(), AppContext.BaseDirectory }
                     .Where(value => !string.IsNullOrWhiteSpace(value)))
        {
            for (var directory = new DirectoryInfo(start!); directory is not null; directory = directory.Parent)
            {
                if (File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln"))
                    && Directory.Exists(Path.Combine(directory.FullName, "Modules")))
                    return directory.FullName;
            }
        }

        throw new DirectoryNotFoundException("Could not locate the ERPSYSTEM API root.");
    }

    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "architecture-test-user";
        public string? TenantId => "architecture-test-tenant";
        public int? CompanyId => 1;
    }
}
