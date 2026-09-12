using System.Diagnostics;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.HR;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

/// <summary>
/// Guards for module-owned SQL schemas, connection resolution, and migration
/// metadata. Established modules may use short aliases (HR=hr, Accounting=acc,
/// PointOfSale=pos, CustomerRelationshipManagement=crm, Inventory=inv), while
/// every module keeps a unique valid schema and its EF history table inside it.
/// </summary>
public sealed class ModuleSchemaTests
{
    private static readonly string ApiDirectory = FindApiDirectory();
    private static readonly string ModulesDirectory = Path.Combine(ApiDirectory, "Modules");
    private static readonly string ScaffolderScript =
        Path.Combine(ApiDirectory, "scripts", "New-ErpModule.ps1");

    private static readonly string[] BannedSchemas =
    [
        "dbo", "accounting", "point_of_sale", "pointofsale", "inventory",
        "customerrelationshipmanagement", "customer_relationship_management",
    ];

    // ---------- HR schema ----------

    [Fact]
    public void HrModel_UsesHrDefaultSchemaForEveryTable()
    {
        using var db = CreateHrContext();

        Assert.Equal("hr", ApplicationDbContext.Schema);
        Assert.Equal("hr", db.Model.GetDefaultSchema());

        var violations = db.Model.GetEntityTypes()
            .Where(t => !t.IsOwned())
            .Select(t => (Name: t.ClrType.Name, Schema: t.GetSchema() ?? db.Model.GetDefaultSchema()))
            .Where(x => !string.Equals(x.Schema, "hr", StringComparison.Ordinal))
            .Select(x => $"{x.Name} -> {x.Schema ?? "<null>"}")
            .ToList();

        Assert.Contains(db.Model.GetEntityTypes(), t => !t.IsOwned());
        Assert.True(violations.Count == 0,
            "Every HR table must live in hr: " + string.Join("; ", violations));
    }

    [Fact]
    public void HrBootstrap_ExposesExactSchemaAndHistoryTransferSql()
    {
        Assert.Equal(
            "IF SCHEMA_ID(N'hr') IS NULL EXEC(N'CREATE SCHEMA [hr]');",
            HRModule.EnsureSchemaSql);
        Assert.Equal(
            "IF OBJECT_ID(N'[hr].[__EFMigrationsHistory]', N'U') IS NULL "
            + "AND OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NOT NULL "
            + "EXEC(N'ALTER SCHEMA [hr] TRANSFER [dbo].[__EFMigrationsHistory];');",
            HRModule.MoveHistoryToModuleSchemaSql);
    }

    // ---------- generic gate over every module DbContext ----------

    [Fact]
    public void EveryModuleDbContext_DeclaresUniqueValidSchema()
    {
        var schemas = ModuleDbContexts()
            .Select(t => (Context: t.Name, Schema: ModuleSchema(t)))
            .ToList();

        Assert.NotEmpty(schemas);

        foreach (var (context, schema) in schemas)
        {
            Assert.False(string.IsNullOrWhiteSpace(schema), $"{context} must declare a Schema constant.");
            Assert.True(
                Regex.IsMatch(schema, "^[a-z][a-z0-9_]{0,62}$"),
                $"{context} schema '{schema}' must be a lowercase SQL identifier (max 63 characters).");
            Assert.DoesNotContain(
                schema,
                BannedSchemas,
                StringComparer.OrdinalIgnoreCase);
        }

        Assert.Equal(
            schemas.Count,
            schemas.Select(x => x.Schema).Distinct(StringComparer.OrdinalIgnoreCase).Count());
    }

    [Fact]
    public void EveryModuleDbContext_ModelMatchesDeclaredSchemaAndHistoryStaysInSchema()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            var schema = ModuleSchema(contextType);
            var configuration = ConfigurationWithDefaultConnection();
            using var provider = BuildModuleProvider(contextType, configuration);
            using var scope = provider.CreateScope();
            var db = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);
            Assert.Equal(schema, db.Model.GetDefaultSchema());

            var registration = ModuleInfrastructureSources(contextType)
                .Select(File.ReadAllText)
                .FirstOrDefault(source => source.Contains("MigrationsHistoryTable", StringComparison.Ordinal));
            Assert.False(
                string.IsNullOrEmpty(registration),
                $"{contextType.Name} registration must configure MigrationsHistoryTable.");
            Assert.Contains(
                $"{contextType.Name}.Schema",
                registration!,
                StringComparison.Ordinal);
            Assert.Contains(
                "HasDefaultSchema(Schema)",
                ModuleDbContextSource(contextType),
                StringComparison.Ordinal);
        }
    }

    [Fact]
    public void EveryModuleDbContext_UsesModuleConnectionThenDefaultFallback()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            var moduleName = ModuleName(contextType);
            var moduleConnection =
                $"Server=(local);Database={moduleName}ModuleConnection;Trusted_Connection=True;";
            var defaultConnection =
                "Server=(local);Database=DefaultModuleConnection;Trusted_Connection=True;";

            var moduleFirst = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    [$"ConnectionStrings:{moduleName}"] = moduleConnection,
                    ["ConnectionStrings:DefaultConnection"] = defaultConnection,
                })
                .Build();
            Assert.Equal(
                $"{moduleName}ModuleConnection",
                DatabaseName(ResolveRegisteredConnectionString(contextType, moduleFirst)));

            var fallbackOnly = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = defaultConnection,
                })
                .Build();
            Assert.Equal(
                "DefaultModuleConnection",
                DatabaseName(ResolveRegisteredConnectionString(contextType, fallbackOnly)));
        }
    }

    [Fact]
    public void EveryModuleDbContext_HasDesignTimeFactoryWithModuleFirstFallback()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            var moduleName = ModuleName(contextType);
            var moduleDirectory = Path.Combine(
                ModulesDirectory,
                moduleName,
                $"ErpSystem.Modules.{moduleName}.Infrastructure");
            var factoryPath = Directory.GetFiles(
                    moduleDirectory,
                    $"{contextType.Name}DesignFactory.cs",
                    SearchOption.AllDirectories)
                .SingleOrDefault();

            Assert.True(factoryPath is not null,
                $"{contextType.Name} must have a module-local design-time factory.");
            var source = File.ReadAllText(factoryPath!);
            Assert.Contains($"\"{moduleName}\"", source, StringComparison.Ordinal);
            Assert.Contains("\"DefaultConnection\"", source, StringComparison.Ordinal);
            Assert.Contains("GetConnectionString(name)", source, StringComparison.Ordinal);
            Assert.Contains("AddEnvironmentVariables()", source, StringComparison.Ordinal);
            Assert.Contains("ErpSystem.Api.csproj", source, StringComparison.Ordinal);
            Assert.Contains("appsettings.example.json", source, StringComparison.Ordinal);
            Assert.Contains("AddJsonFile(\"appsettings.json\", optional: true", source, StringComparison.Ordinal);
            Assert.Contains("AddJsonFile(\"appsettings.example.json\", optional: true", source, StringComparison.Ordinal);
            Assert.Contains("AddJsonFile(\"appsettings.\" + environment + \".json\", optional: true", source, StringComparison.Ordinal);
            Assert.Contains("StartsWith('<')", source, StringComparison.Ordinal);
            Assert.Contains("EndsWith('>')", source, StringComparison.Ordinal);
            Assert.Contains("No effective connection string was configured", source, StringComparison.Ordinal);
            Assert.DoesNotContain("optional: false", source, StringComparison.Ordinal);

            var moduleMarker = source.IndexOf($"\"{moduleName}\"", StringComparison.Ordinal);
            var defaultMarker = source.IndexOf("\"DefaultConnection\"", StringComparison.Ordinal);
            Assert.True(moduleMarker >= 0 && moduleMarker < defaultMarker,
                $"{Path.GetFileName(factoryPath)} must resolve the module-specific connection before DefaultConnection.");
            Assert.True(
                source.IndexOf("AddEnvironmentVariables()", StringComparison.Ordinal)
                > source.LastIndexOf("AddJsonFile(", StringComparison.Ordinal),
                $"{Path.GetFileName(factoryPath)} must apply environment variables after optional JSON files.");
        }
    }

    [Fact]
    public void EveryMigratedModuleDbContext_HasNoPendingModelChanges()
    {
        foreach (var contextType in ModuleDbContexts())
        {
            using var provider = BuildModuleProvider(contextType, ConfigurationWithDefaultConnection());
            using var scope = provider.CreateScope();
            var db = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);

            if (!db.Database.GetMigrations().Any())
                continue;

            Assert.False(
                db.Database.HasPendingModelChanges(),
                $"{contextType.Name} has model changes that are not represented by its latest migration snapshot.");
        }
    }

    // ---------- scaffolder short-schema mapping ----------

    [Theory]
    [InlineData("PointOfSale", "pos")]
    [InlineData("CustomerRelationshipManagement", "crm")]
    [InlineData("Inventory", "inv")]
    public void Scaffolder_MapsKnownModuleToShortSchema(string moduleName, string expectedSchema)
    {
        // Single disposal path: IsolatedWorkspace.Dispose owns cleanup.
        using var workspace = CreateIsolatedWorkspace();

        var result = RunScaffolder(
            ScaffolderScript,
            "-ModuleName " + moduleName + " -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.True(result.ExitCode == 0, "Scaffolder failed for " + moduleName + ": " + result.Output);
        var dbContext = File.ReadAllText(Path.Combine(
            workspace.ApiRoot, "Modules", moduleName,
            $"ErpSystem.Modules.{moduleName}.Infrastructure", $"{moduleName}DbContext.cs"));
        Assert.Contains($"public const string Schema = \"{expectedSchema}\"", dbContext);
        Assert.DoesNotContain("point_of_sale", dbContext, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Scaffolder_PreservesExplicitSchemaOverride()
    {
        // Single disposal path: IsolatedWorkspace.Dispose owns cleanup.
        using var workspace = CreateIsolatedWorkspace();

        var result = RunScaffolder(
            ScaffolderScript,
            "-ModuleName PointOfSale -DatabaseSchema sales -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.True(result.ExitCode == 0, "Scaffolder override failed: " + result.Output);
        var dbContext = File.ReadAllText(Path.Combine(
            workspace.ApiRoot, "Modules", "PointOfSale",
            "ErpSystem.Modules.PointOfSale.Infrastructure", "PointOfSaleDbContext.cs"));
        Assert.Contains("public const string Schema = \"sales\"", dbContext);
    }

    // ---------- migrations ----------

    [Fact]
    public void HrSchemaMigration_MovesTablesWithoutDrops()
    {
        var migrationsDir = Path.Combine(
            ModulesDirectory, "HR",
            "ErpSystem.Modules.HR.Infrastructure", "Migrations");
        var migration = Directory.GetFiles(migrationsDir, "*MoveHrTablesToHrSchema.cs")
            .FirstOrDefault(file => !file.EndsWith(".Designer.cs", StringComparison.OrdinalIgnoreCase));

        Assert.True(
            !string.IsNullOrEmpty(migration) && File.Exists(migration),
            "Missing HR MoveHrTablesToHrSchema migration.");
        var source = File.ReadAllText(migration!);

        Assert.Contains("EnsureSchema", source, StringComparison.Ordinal);
        Assert.Contains("\"hr\"", source, StringComparison.Ordinal);
        Assert.Contains("RenameTable", source, StringComparison.Ordinal);
        Assert.DoesNotContain("DropTable", source, StringComparison.Ordinal);
        Assert.DoesNotContain("CreateTable", source, StringComparison.Ordinal);

        // Every table the migration moves must be exactly the set of tables
        // the model snapshot maps into hr, so an omitted or added table fails.
        // The ToTable prefix matches both the (name, schema) and the
        // (name, schema, buildAction) overloads; Distinct collapses tables
        // shared with owned types.
        var upSection = source.Substring(0, source.IndexOf(
            "protected override void Down", StringComparison.Ordinal));
        var movedTables = Regex.Matches(upSection, "RenameTable\\(\\s*name:\\s*\"(\\w+)\"")
            .Select(match => match.Groups[1].Value)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();

        var snapshot = File.ReadAllText(Path.Combine(
            ModulesDirectory, "HR",
            "ErpSystem.Modules.HR.Infrastructure", "Migrations",
            "ApplicationDbContextModelSnapshot.cs"));
        var snapshotTables = Regex.Matches(snapshot, "ToTable\\(\"(\\w+)\",\\s*\"hr\"")
            .Select(match => match.Groups[1].Value)
            .Distinct(StringComparer.Ordinal)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();
        var moveMigrationName = Path.GetFileName(migration!);
        var tablesCreatedAfterMove = Directory.GetFiles(migrationsDir, "*.cs")
            .Where(file => !file.EndsWith(".Designer.cs", StringComparison.OrdinalIgnoreCase))
            .Where(file => string.Compare(
                Path.GetFileName(file),
                moveMigrationName,
                StringComparison.Ordinal) > 0)
            .SelectMany(file => Regex.Matches(
                    File.ReadAllText(file),
                    "CreateTable\\(\\s*name:\\s*\"(\\w+)\"")
                .Select(match => match.Groups[1].Value))
            .ToHashSet(StringComparer.Ordinal);
        snapshotTables.RemoveAll(tablesCreatedAfterMove.Contains);

        Assert.NotEmpty(movedTables);
        Assert.Equal(snapshotTables, movedTables);
    }

    [Fact]
    public void AccountingInitialMigration_Exists()
    {
        var migrationsDir = Path.Combine(
            ModulesDirectory, "Accounting",
            "ErpSystem.Modules.Accounting.Infrastructure", "Migrations");

        Assert.True(Directory.Exists(migrationsDir), "Missing Accounting Migrations directory.");
        Assert.NotEmpty(Directory.GetFiles(migrationsDir, "*InitializeAccountingSchema.cs"));
    }

    // ---------- helpers ----------

    private static IEnumerable<Type> ModuleDbContexts()
    {
        var assemblies = Directory.GetDirectories(ModulesDirectory)
            .Select(Path.GetFileName)
            .OfType<string>()
            .Select(moduleName => Assembly.Load($"ErpSystem.Modules.{moduleName}.Infrastructure"));

        return assemblies
            .SelectMany(assembly =>
            {
                try
                {
                    return assembly.GetTypes();
                }
                catch (ReflectionTypeLoadException exception)
                {
                    return exception.Types.OfType<Type>();
                }
            })
            .Where(type =>
                !type.IsAbstract
                && typeof(DbContext).IsAssignableFrom(type)
                && type.GetField("Schema", BindingFlags.Public | BindingFlags.Static) is
                {
                    IsLiteral: true,
                    FieldType.Name: "String",
                })
            .OrderBy(type => type.Name, StringComparer.Ordinal)
            .ToList();
    }

    private static string ModuleSchema(Type contextType) =>
        (string?)contextType.GetField("Schema", BindingFlags.Public | BindingFlags.Static)!
            .GetRawConstantValue() ?? string.Empty;

    private static ApplicationDbContext CreateHrContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=(local);Database=ModuleSchemaGate;Trusted_Connection=True;")
            .Options;

        return new ApplicationDbContext(options, new SchemaGateActor(), TimeProvider.System);
    }

    private static IConfiguration ConfigurationWithDefaultConnection() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(local);Database=ModuleSchemaGate;Trusted_Connection=True;",
            })
            .Build();

    private static ServiceProvider BuildModuleProvider(Type contextType, IConfiguration configuration)
    {
        var services = new ServiceCollection();
        var actor = new SchemaGateActor();
        services.AddSingleton<ICurrentActor>(actor);
        services.AddSingleton<ICurrentExecutionContext>(actor);
        services.AddSingleton(TimeProvider.System);
        InvokeInfrastructureRegistration(contextType, services, configuration);
        return services.BuildServiceProvider();
    }

    private static string? ResolveRegisteredConnectionString(Type contextType, IConfiguration configuration)
    {
        using var provider = BuildModuleProvider(contextType, configuration);
        using var scope = provider.CreateScope();
        var db = (DbContext)scope.ServiceProvider.GetRequiredService(contextType);
        return db.Database.GetConnectionString();
    }

    private static string? DatabaseName(string? connectionString)
    {
        Assert.False(string.IsNullOrWhiteSpace(connectionString));
        var builder = new System.Data.Common.DbConnectionStringBuilder
        {
            ConnectionString = connectionString!
        };

        return builder.TryGetValue("Initial Catalog", out var initialCatalog)
            ? Convert.ToString(initialCatalog)
            : builder.TryGetValue("Database", out var database)
                ? Convert.ToString(database)
                : null;
    }

    private static void InvokeInfrastructureRegistration(
        Type contextType,
        IServiceCollection services,
        IConfiguration configuration)
    {
        var moduleName = ModuleName(contextType);
        var expectedMethodName = moduleName.Equals("HR", StringComparison.Ordinal)
            ? "AddDatabaseservice"
            : $"Add{moduleName}Infrastructure";
        var addMethod = contextType.Assembly.GetTypes()
            .SelectMany(type => type.GetMethods(BindingFlags.Public | BindingFlags.Static))
            .FirstOrDefault(method =>
                method.Name.Equals(expectedMethodName, StringComparison.Ordinal)
                && method.GetParameters() is
                [
                { ParameterType.Name: "IServiceCollection" },
                { ParameterType.Name: "IConfiguration" },
                ]);
        Assert.True(addMethod is not null, $"No infrastructure registration found for {contextType.Name}.");
        addMethod!.Invoke(null, [services, configuration]);
    }

    private static string ModuleName(Type contextType) =>
        (contextType.Namespace ?? string.Empty)
            .Split('.', StringSplitOptions.RemoveEmptyEntries)
            .ElementAtOrDefault(2) ?? string.Empty;

    private static IEnumerable<string> ModuleInfrastructureSources(Type contextType)
    {
        // Owning module directory derived from the CLR namespace:
        // ErpSystem.Modules.{Module}.Infrastructure -> Modules/{Module}.
        var moduleName = ModuleName(contextType);
        var moduleDir = Path.Combine(ModulesDirectory, moduleName);
        Assert.True(Directory.Exists(moduleDir), $"Missing module directory for {contextType.Name}.");

        return Directory.GetFiles(moduleDir, "*.cs", SearchOption.AllDirectories)
            .Where(file =>
                !file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                && !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"));
    }

    private static string ModuleDbContextSource(Type contextType)
    {
        var direct = Directory.GetFiles(ModulesDirectory, $"{contextType.Name}.cs", SearchOption.AllDirectories)
            .FirstOrDefault();
        Assert.True(!string.IsNullOrEmpty(direct), $"Missing source file for {contextType.Name}.");
        return File.ReadAllText(direct!);
    }

    private sealed class SchemaGateActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }

    private sealed class IsolatedWorkspace(string apiRoot, string root, string stubBin) : IDisposable
    {
        public string ApiRoot { get; } = apiRoot;
        public string Root { get; } = root;
        public string StubBin { get; } = stubBin;

        public void Dispose()
        {
            DeleteWorkspace(this);
        }
    }

    private static IsolatedWorkspace CreateIsolatedWorkspace()
    {
        var root = Path.Combine(Path.GetTempPath(), "ErpModuleSchema", Guid.NewGuid().ToString("N"));
        var fakeApi = Path.Combine(root, "api");
        var stubBin = Path.Combine(root, "stubbin");
        Directory.CreateDirectory(Path.Combine(fakeApi, "Modules"));
        Directory.CreateDirectory(Path.Combine(fakeApi, "ErpSystem.Api", "Modules"));
        Directory.CreateDirectory(Path.Combine(root, "documentation", "modules"));
        Directory.CreateDirectory(stubBin);

        File.Copy(
            Path.Combine(ApiDirectory, "Directory.Packages.props"),
            Path.Combine(fakeApi, "Directory.Packages.props"));
        File.WriteAllText(Path.Combine(fakeApi, "ErpSystem.sln"), "Microsoft Visual Studio Solution File\r\n");
        File.WriteAllText(
            Path.Combine(fakeApi, "ErpSystem.Api", "ErpSystem.Api.csproj"),
            "<Project Sdk=\"Microsoft.NET.Sdk.Web\">\r\n"
            + "  <ItemGroup>\r\n"
            + "    <ProjectReference Include=\"..\\BuildingBlocks\\ErpSystem.BuildingBlocks.Modularity\\ErpSystem.BuildingBlocks.Modularity.csproj\" />\r\n"
            + "    <!-- <erp-module-references> -->\r\n"
            + "    <!-- </erp-module-references> -->\r\n"
            + "  </ItemGroup>\r\n"
            + "</Project>\r\n");
        File.WriteAllText(
            Path.Combine(fakeApi, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs"),
            "public static class ErpModuleRegistry\n{\n    public static object[] Create() =>\n    [\n"
            + "        // <erp-module-registrations>\n"
            + "        // </erp-module-registrations>\n    ];\n}\n");

        // Stub dotnet so the generator's solution attach succeeds without a
        // real SDK project graph. Mirrors ModuleModularityTests.
        var dotnetStubPath = Path.Combine(stubBin, OperatingSystem.IsWindows() ? "dotnet.cmd" : "dotnet");
        if (OperatingSystem.IsWindows())
        {
            File.WriteAllText(
                dotnetStubPath,
                "@echo off\r\nexit /b 0\r\n");
        }
        else
        {
            File.WriteAllText(dotnetStubPath, "#!/bin/sh\nexit 0\n");
            File.SetUnixFileMode(
                dotnetStubPath,
                UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute
                | UnixFileMode.GroupRead | UnixFileMode.GroupExecute
                | UnixFileMode.OtherRead | UnixFileMode.OtherExecute);
        }

        return new IsolatedWorkspace(fakeApi, root, stubBin);
    }

    private static void DeleteWorkspace(IsolatedWorkspace workspace)
    {
        try
        {
            if (Directory.Exists(workspace.Root))
                Directory.Delete(workspace.Root, recursive: true);
        }
        catch
        {
            // Best effort cleanup; the OS temp directory is the fallback.
        }
    }

    private sealed record ScaffolderResult(int ExitCode, string Output);

    private static ScaffolderResult RunScaffolder(string script, string arguments, string? prependToPath = null)
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = FindPowerShell(),
                Arguments = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \""
                    + script + "\" " + arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            }
        };
        if (prependToPath is not null)
            process.StartInfo.Environment["PATH"] =
                prependToPath + Path.PathSeparator + process.StartInfo.Environment["PATH"];

        var output = new System.Text.StringBuilder();
        process.OutputDataReceived += (_, e) => { if (e.Data is not null) output.AppendLine(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (e.Data is not null) output.AppendLine(e.Data); };
        Assert.True(process.Start(), "Could not start PowerShell to run the module scaffolder.");
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        Assert.True(process.WaitForExit(180000), "Module scaffolder timed out after 180 seconds.");
        process.WaitForExit();

        return new ScaffolderResult(process.ExitCode, output.ToString());
    }

    private static string FindPowerShell()
    {
        foreach (var candidate in new[] { "pwsh", "powershell" })
        {
            try
            {
                using var probe = Process.Start(new ProcessStartInfo
                {
                    FileName = candidate,
                    Arguments = "-NoProfile -NonInteractive -Command \"$PSVersionTable.PSVersion\"",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                });
                if (probe is not null && probe.WaitForExit(15000) && probe.ExitCode == 0)
                    return candidate;
            }
            catch
            {
            }
        }

        Assert.Fail("No PowerShell (pwsh/powershell) available to run the module scaffolder.");
        throw new InvalidOperationException("Unreachable: Assert.Fail always throws.");
    }

    private static string FindApiDirectory([CallerFilePath] string sourcePath = "")
    {
        var startingDirectories = new[]
        {
            Path.GetDirectoryName(sourcePath),
            Directory.GetCurrentDirectory(),
            AppContext.BaseDirectory,
        }
        .Where(path => !string.IsNullOrWhiteSpace(path))
        .Distinct(StringComparer.OrdinalIgnoreCase);

        foreach (var startingDirectory in startingDirectories)
        {
            var directory = new DirectoryInfo(startingDirectory!);
            while (directory is not null)
            {
                var candidate = Path.Combine(directory.FullName, "ErpSystem.Api", "ErpSystem.Api.csproj");
                if (File.Exists(candidate))
                    return directory.FullName;
                directory = directory.Parent;
            }
        }

        throw new InvalidOperationException("Could not locate the api directory from source, working, or output paths.");
    }
}
