using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class ModulePersistenceStructureTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ModulesRoot = Path.Combine(ApiRoot, "Modules");

    private static readonly string[] BannedSchemas =
    [
        "dbo",
        "accounting",
        "point_of_sale",
        "pointofsale",
        "inventory",
        "customerrelationshipmanagement",
        "customer_relationship_management"
    ];

    [Fact]
    public void EveryModule_OwnsOneUniqueValidSchemaAndHistoryTable()
    {
        var schemas = new List<(string Module, string Schema)>();

        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var infrastructureRoot = InfrastructureRoot(moduleRoot, module);
            var sourceFiles = SourceFiles(infrastructureRoot)
                .Select(path => (Path: path, Source: File.ReadAllText(path)))
                .ToArray();
            var context = Assert.Single(
                sourceFiles,
                item => Regex.IsMatch(
                    item.Source,
                    "public\\s+const\\s+string\\s+Schema\\s*=\\s*\\\"(?<schema>[a-z][a-z0-9_]*)\\\"",
                    RegexOptions.CultureInvariant));
            var match = Regex.Match(
                context.Source,
                "public\\s+const\\s+string\\s+Schema\\s*=\\s*\\\"(?<schema>[a-z][a-z0-9_]*)\\\"",
                RegexOptions.CultureInvariant);
            var schema = match.Groups["schema"].Value;

            Assert.Matches("^[a-z][a-z0-9_]{0,62}$", schema);
            Assert.DoesNotContain(schema, BannedSchemas, StringComparer.OrdinalIgnoreCase);
            Assert.Contains("HasDefaultSchema(Schema)", context.Source, StringComparison.Ordinal);
            Assert.Contains(
                sourceFiles,
                item => item.Source.Contains("MigrationsHistoryTable(\"__EFMigrationsHistory\"", StringComparison.Ordinal)
                        && item.Source.Contains(".Schema", StringComparison.Ordinal));

            schemas.Add((module, schema));
        }

        Assert.NotEmpty(schemas);
        Assert.Equal(
            schemas.Count,
            schemas.Select(item => item.Schema).Distinct(StringComparer.OrdinalIgnoreCase).Count());
    }

    [Fact]
    public void EveryModuleDbContext_HasModuleFirstDesignTimeFactory()
    {
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var infrastructureRoot = InfrastructureRoot(moduleRoot, module);
            var contextSource = SourceFiles(infrastructureRoot)
                .Select(path => (Path: path, Source: File.ReadAllText(path)))
                .Single(item => item.Source.Contains("public const string Schema", StringComparison.Ordinal));
            var contextName = Regex.Match(
                contextSource.Source,
                "class\\s+(?<name>[A-Za-z0-9_]+DbContext)\\b",
                RegexOptions.CultureInvariant).Groups["name"].Value;
            Assert.False(string.IsNullOrWhiteSpace(contextName), $"Could not determine DbContext class for {module}.");

            var factoryPath = Assert.Single(Directory.GetFiles(
                infrastructureRoot,
                contextName + "DesignFactory.cs",
                SearchOption.AllDirectories));
            var source = File.ReadAllText(factoryPath);

            Assert.Contains($"\"{module}\"", source, StringComparison.Ordinal);
            Assert.Contains("\"DefaultConnection\"", source, StringComparison.Ordinal);
            Assert.Contains("GetConnectionString(name)", source, StringComparison.Ordinal);
            Assert.Contains("AddEnvironmentVariables()", source, StringComparison.Ordinal);
            Assert.Contains("appsettings.example.json", source, StringComparison.Ordinal);
            Assert.Contains("appsettings.json", source, StringComparison.Ordinal);
            Assert.Contains("No effective connection string was configured", source, StringComparison.Ordinal);
            Assert.Contains("StartsWith('<')", source, StringComparison.Ordinal);
            Assert.Contains("EndsWith('>')", source, StringComparison.Ordinal);
            Assert.Contains("MigrationsHistoryTable(\"__EFMigrationsHistory\"", source, StringComparison.Ordinal);

            var moduleMarker = source.IndexOf($"\"{module}\"", StringComparison.Ordinal);
            var defaultMarker = source.IndexOf("\"DefaultConnection\"", StringComparison.Ordinal);
            Assert.True(
                moduleMarker >= 0 && moduleMarker < defaultMarker,
                $"{Path.GetFileName(factoryPath)} must resolve the module-specific connection before DefaultConnection.");
            Assert.True(
                source.IndexOf("AddEnvironmentVariables()", StringComparison.Ordinal)
                > source.LastIndexOf("AddJsonFile(", StringComparison.Ordinal),
                $"{Path.GetFileName(factoryPath)} must apply environment variables after JSON configuration.");
        }
    }

    [Fact]
    public void EveryModuleDbContext_HasBaselineMigrationAndModelSnapshot()
    {
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var infrastructureRoot = InfrastructureRoot(moduleRoot, module);
            var contextSource = SourceFiles(infrastructureRoot)
                .Select(path => (Path: path, Source: File.ReadAllText(path)))
                .Single(item => item.Source.Contains("public const string Schema", StringComparison.Ordinal));
            var contextName = Regex.Match(
                contextSource.Source,
                "class\\s+(?<name>[A-Za-z0-9_]+DbContext)\\b",
                RegexOptions.CultureInvariant).Groups["name"].Value;
            Assert.False(string.IsNullOrWhiteSpace(contextName), $"Could not determine DbContext class for {module}.");

            var migrationsRoot = Path.Combine(infrastructureRoot, "Migrations");
            Assert.True(
                Directory.Exists(migrationsRoot),
                $"Module '{module}' must keep its EF migrations under {migrationsRoot}.");

            var migrationSources = Directory.GetFiles(migrationsRoot, "*.cs", SearchOption.TopDirectoryOnly)
                .Where(path => Regex.IsMatch(
                    Path.GetFileName(path),
                    "^[0-9]{14}_.+\\.cs$",
                    RegexOptions.CultureInvariant))
                .Where(path => !path.EndsWith(".Designer.cs", StringComparison.OrdinalIgnoreCase))
                .ToArray();
            Assert.NotEmpty(migrationSources);

            var snapshotPath = Assert.Single(Directory.GetFiles(
                migrationsRoot,
                contextName + "ModelSnapshot.cs",
                SearchOption.TopDirectoryOnly));
            var snapshotSource = File.ReadAllText(snapshotPath);
            Assert.Contains($"[DbContext(typeof({contextName}))]", snapshotSource, StringComparison.Ordinal);

            foreach (var migrationSource in migrationSources)
            {
                var designerPath = Path.ChangeExtension(migrationSource, ".Designer.cs");
                Assert.True(
                    File.Exists(designerPath),
                    $"Migration '{Path.GetFileName(migrationSource)}' for module '{module}' is missing its designer file.");
            }
        }
    }

    [Fact]
    public void EveryModuleBootstrap_OwnsSchemaCreationAndEfMigrationExecution()
    {
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var bootstrapRoot = Path.Combine(moduleRoot, $"ErpSystem.Modules.{module}");
            var bootstrapSources = SourceFiles(bootstrapRoot)
                .Select(path => (Path: path, Source: File.ReadAllText(path)))
                .ToArray();
            var bootstrapSource = Assert.Single(
                bootstrapSources,
                item => item.Source.Contains(": IModule", StringComparison.Ordinal));

            Assert.Contains("EnsureSchemaSql", bootstrapSource.Source, StringComparison.Ordinal);
            Assert.Contains("SCHEMA_ID", bootstrapSource.Source, StringComparison.Ordinal);
            Assert.Contains(".Schema", bootstrapSource.Source, StringComparison.Ordinal);
            Assert.Contains("ModuleMigrationSettings.ShouldApplyMigrations", bootstrapSource.Source, StringComparison.Ordinal);
            Assert.Contains("ExecuteSqlRawAsync(EnsureSchemaSql", bootstrapSource.Source, StringComparison.Ordinal);
            Assert.Contains("Database.MigrateAsync(", bootstrapSource.Source, StringComparison.Ordinal);
            Assert.Contains("GetPendingMigrationsAsync(", bootstrapSource.Source, StringComparison.Ordinal);
        }
    }

    private static IEnumerable<string> ModuleDirectories() =>
        Directory.GetDirectories(ModulesRoot)
            .Where(path => !Path.GetFileName(path).StartsWith('.'))
            .OrderBy(path => path, StringComparer.OrdinalIgnoreCase);

    private static string InfrastructureRoot(string moduleRoot, string module) =>
        Path.Combine(moduleRoot, $"ErpSystem.Modules.{module}.Infrastructure");

    private static IEnumerable<string> SourceFiles(string root) =>
        Directory.GetFiles(root, "*.cs", SearchOption.AllDirectories)
            .Where(path =>
                !path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
                && !path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase));

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
}
