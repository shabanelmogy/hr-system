using System.Reflection;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.BuildingBlocks.Context.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

/// <summary>
/// Proves that the installed module migration chains can be composed on one
/// clean SQL Server database, while preserving each module's schema and history
/// ownership. Persistence metadata is discovered from each installed module's
/// own infrastructure assembly so adding a module with its first migration
/// extends this gate without editing the test.
/// </summary>
public sealed class ModuleMigrationIntegrationTests
{
    [SqlServerFact]
    public async Task InstalledModuleMigrations_ApplyOnCleanDatabase_AndSecondRunIsIdempotent()
    {
        await using var database =
            await SqlServerTestDatabase.CreateAsync("ErpSystemModuleMigrations");

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = database.ConnectionString,
                ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true",
            })
            .Build();

        var executionContext = new TestExecutionContext("migration-test", "migration-tenant", 1);
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddSingleton<ICurrentExecutionContext>(executionContext);
        services.AddSingleton<ICurrentExecutionContextScope>(executionContext);
        services.AddModules(configuration, ErpModuleRegistry.Create());

        await using var provider = services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateScopes = true,
        });
        var catalog = provider.GetRequiredService<ModuleCatalog>();

        var descriptors = DiscoverModulePersistence(catalog.LifecycleModules);

        await catalog.MigrateAsync(provider);
        await AssertAllModuleSchemasAndMigrationsAsync(provider, descriptors);
        Assert.Empty(await catalog.GetPendingMigrationsAsync(provider));

        // A deployment can safely retry the migration command after a process
        // restart. The second lifecycle must not add history rows or fail on
        // already-created schemas/tables.
        await catalog.MigrateAsync(provider);
        await AssertAllModuleSchemasAndMigrationsAsync(provider, descriptors);
        Assert.Empty(await catalog.GetPendingMigrationsAsync(provider));
    }

    private static async Task AssertAllModuleSchemasAndMigrationsAsync(
        IServiceProvider provider,
        IReadOnlyList<ModulePersistenceDescriptor> descriptors)
    {
        foreach (var descriptor in descriptors)
        {
            await AssertContextSchemaAndHistoryAsync(
                provider,
                descriptor.ContextType,
                descriptor.Schema);
        }
    }

    private static async Task AssertContextSchemaAndHistoryAsync(
        IServiceProvider provider,
        Type contextType,
        string schema)
    {
        await using var scope = provider.CreateAsyncScope();
        var context = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);
        var migrations = context.Database.GetMigrations().ToArray();
        Assert.NotEmpty(migrations);
        Assert.Matches("^[a-z][a-z0-9_]{0,62}$", schema);
        Assert.Equal(schema, context.Model.GetDefaultSchema());

        await context.Database.OpenConnectionAsync();
        try
        {
            var applied = (await context.Database.GetAppliedMigrationsAsync()).ToArray();
            var pending = (await context.Database.GetPendingMigrationsAsync()).ToArray();

            Assert.Equal(migrations, applied);
            Assert.Empty(pending);

            await using var command = context.Database.GetDbConnection().CreateCommand();
            command.CommandText = """
                SELECT
                    CASE WHEN SCHEMA_ID(@schema) IS NULL THEN CAST(0 AS bigint) ELSE CAST(1 AS bigint) END,
                    (SELECT COUNT_BIG(*)
                     FROM sys.tables AS tables
                     INNER JOIN sys.schemas AS schemas ON schemas.schema_id = tables.schema_id
                     WHERE schemas.name = @schema AND tables.name = N'__EFMigrationsHistory'),
                    (SELECT COUNT_BIG(*)
                     FROM sys.tables AS tables
                     INNER JOIN sys.schemas AS schemas ON schemas.schema_id = tables.schema_id
                     WHERE schemas.name = @schema AND tables.name = N'__EFMigrationsHistory'
                       AND EXISTS (
                           SELECT 1 FROM sys.columns
                           WHERE object_id = tables.object_id AND name = N'MigrationId'));
                """;
            var parameter = command.CreateParameter();
            parameter.ParameterName = "@schema";
            parameter.Value = schema;
            command.Parameters.Add(parameter);

            await using var reader = await command.ExecuteReaderAsync();
            Assert.True(await reader.ReadAsync());
            Assert.Equal(1L, reader.GetInt64(0));
            Assert.Equal(1L, reader.GetInt64(1));
            Assert.Equal(1L, reader.GetInt64(2));

            await reader.CloseAsync();
            command.CommandText =
                $"SELECT COUNT_BIG(*) FROM [{schema}].[__EFMigrationsHistory];";
            var historyCount = Convert.ToInt64(await command.ExecuteScalarAsync());
            Assert.Equal((long)migrations.Length, historyCount);
        }
        finally
        {
            await context.Database.CloseConnectionAsync();
        }
    }

    private static IReadOnlyList<ModulePersistenceDescriptor> DiscoverModulePersistence(
        IReadOnlyList<IModule> lifecycleModules)
    {
        var descriptors = new List<ModulePersistenceDescriptor>(lifecycleModules.Count);
        foreach (var module in lifecycleModules)
        {
            var infrastructureAssemblyName = $"ErpSystem.Modules.{module.Name}.Infrastructure";
            var assembly = Assembly.Load(new AssemblyName(infrastructureAssemblyName));
            var contextTypes = GetLoadableTypes(assembly)
                .Where(type =>
                    !type.IsAbstract
                    && typeof(DbContext).IsAssignableFrom(type)
                    && type.GetField("Schema", BindingFlags.Public | BindingFlags.Static) is
                    {
                        IsLiteral: true,
                        FieldType: { } fieldType,
                    } && fieldType == typeof(string))
                .ToArray();

            Assert.True(
                contextTypes.Length == 1,
                $"Module '{module.Name}' must expose exactly one module-owned DbContext with a public const string Schema in {infrastructureAssemblyName}.");
            var contextType = contextTypes.Single();
            var schema = (string?)contextType
                .GetField("Schema", BindingFlags.Public | BindingFlags.Static)!
                .GetRawConstantValue();
            Assert.False(
                string.IsNullOrWhiteSpace(schema),
                $"{contextType.FullName} must declare a non-empty Schema constant.");

            descriptors.Add(new ModulePersistenceDescriptor(module.Name, contextType, schema!));
        }

        Assert.Equal(lifecycleModules.Count, descriptors.Count);
        Assert.Equal(
            lifecycleModules.Select(module => module.Name).OrderBy(name => name, StringComparer.Ordinal),
            descriptors.Select(descriptor => descriptor.ModuleName).OrderBy(name => name, StringComparer.Ordinal));
        Assert.Equal(
            descriptors.Count,
            descriptors.Select(descriptor => descriptor.Schema)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count());

        return descriptors;
    }

    private static IEnumerable<Type> GetLoadableTypes(Assembly assembly)
    {
        try
        {
            return assembly.GetTypes();
        }
        catch (ReflectionTypeLoadException exception)
        {
            return exception.Types.OfType<Type>();
        }
    }

    private sealed record ModulePersistenceDescriptor(
        string ModuleName,
        Type ContextType,
        string Schema);

    private sealed class TestExecutionContext(
        string userId,
        string tenantId,
        int companyId) : ICurrentExecutionContext, ICurrentExecutionContextScope, ICurrentActor
    {
        public string? UserId { get; } = userId;

        public string? TenantId { get; } = tenantId;

        public int? CompanyId { get; } = companyId;

        public IDisposable BeginScope(string _, string __, int? ___ = null) => NoopScope.Instance;

        private sealed class NoopScope : IDisposable
        {
            public static readonly NoopScope Instance = new();

            public void Dispose()
            {
            }
        }
    }
}

