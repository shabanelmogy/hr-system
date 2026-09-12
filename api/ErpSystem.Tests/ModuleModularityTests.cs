using System.Text.RegularExpressions;
using System.Text.Json;
using System.Xml.Linq;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Accounting;
using ErpSystem.Modules.Accounting.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

/// <summary>
/// Guards for the modular-monolith foundation. The csproj-graph tests read the
/// real project files from disk and are generic over api/Modules/&lt;Module&gt;,
/// so the same rules apply to Accounting and every future business module.
/// </summary>
public sealed class ModuleModularityTests
{
    private static readonly string ApiDirectory = FindApiDirectory();
    private static readonly string ModulesDirectory = Path.Combine(ApiDirectory, "Modules");
    private static readonly string ModuleDocumentationDirectory =
        Path.Combine(Directory.GetParent(ApiDirectory)!.FullName, "documentation", "modules");

    // ---------- ModuleCatalog behavior ----------

    [Fact]
    public void ModuleCatalog_RejectsDuplicateNames_CaseInsensitive()
    {
        Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([new StubModule("Accounting"), new StubModule("accounting")]));
    }

    [Fact]
    public void ModuleCatalog_PreservesExplicitRegistrationOrder()
    {
        var catalog = new ModuleCatalog([new StubModule("B"), new StubModule("A")]);

        Assert.Equal(["B", "A"], catalog.Modules.Select(m => m.Name));
        Assert.Equal(["B", "A"], catalog.LifecycleModules.Select(m => m.Name));
    }

    [Fact]
    public void ModuleCatalog_RejectsInvalidStableVersion()
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
    public void ModuleCatalog_RejectsMissingRequiredDependency()
    {
        var exception = Assert.Throws<InvalidOperationException>(() =>
            new ModuleCatalog([
                new StubModule("Sales", definition: Definition("sales", "Sales", required: ["inventory"]))
            ]));

        Assert.Contains("missing required module dependencies", exception.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("inventory", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ModuleCatalog_AllowsMissingOptionalDependency()
    {
        var catalog = new ModuleCatalog([
            new StubModule("Sales", definition: Definition("sales", "Sales", optional: ["inventory"]))
        ]);

        Assert.Equal(["Sales"], catalog.LifecycleModules.Select(module => module.Name));
    }

    [Fact]
    public void ModuleCatalog_KeepsTechnicalModulesInLifecycleButOutOfTenantAndUserCatalogs()
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
    public void ModuleCatalog_RejectsDefaultModuleThatCannotBeTenantEntitled()
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
    public void ModuleCatalog_RejectsDependencyCyclesIncludingPresentOptionalEdges()
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
    public async Task ModuleCatalog_RunsLifecycleInStableTopologicalOrder()
    {
        var log = new List<string>();
        var catalog = new ModuleCatalog([
            new StubModule("Sales", log, Definition("sales", "Sales", required: ["inventory"])),
            new StubModule("Inventory", log, Definition("inventory", "Inventory")),
            new StubModule("Reporting", log, Definition("reporting", "Reporting"))
        ]);
        var services = new ServiceCollection().BuildServiceProvider();
        var endpoints = new StubEndpoints();
        var app = WebApplication.CreateBuilder().Build();

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
    public async Task ModuleCatalog_RunsLifecycleInRegistrationOrder()
    {
        var log = new List<string>();
        var catalog = new ModuleCatalog([new StubModule("First", log), new StubModule("Second", log)]);
        var services = new ServiceCollection().BuildServiceProvider();
        var endpoints = new StubEndpoints();
        var app = WebApplication.CreateBuilder().Build();

        catalog.RegisterServices(new ServiceCollection(), new ConfigurationBuilder().Build());
        catalog.ConfigureEarlyApplication(app);
        catalog.MapEndpoints(endpoints);
        await catalog.MigrateAsync(services);
        catalog.ConfigureApplication(app);
        await catalog.InitializeAsync(app);

        Assert.Equal(
            [
                "register:First", "register:Second", "early:First", "early:Second",
                "map:First", "map:Second",
                "migrate:First", "migrate:Second", "configure:First", "configure:Second",
                "initialize:First", "initialize:Second"
            ],
            log);
    }

    [Fact]
    public void AddModules_RegistersCatalogAsSingleton()
    {
        var services = new ServiceCollection();
        services.AddModules(new ConfigurationBuilder().Build(), new StubModule("X"));

        var provider = services.BuildServiceProvider();
        Assert.NotNull(provider.GetRequiredService<ModuleCatalog>());
    }

    // ---------- Accounting runtime boundary ----------

    [Fact]
    public void AccountingModule_HasExpectedName()
    {
        Assert.Equal("Accounting", new AccountingModule().Name);
    }

    [Fact]
    public void AccountingInfrastructure_UsesAccountingDefaultSchema()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=(local);Database=ModularityTests;Trusted_Connection=True;"
            })
            .Build();

        var services = new ServiceCollection();
        services.AddAccountingInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();

        Assert.Equal(AccountingDbContext.Schema, db.Model.GetDefaultSchema());
        Assert.Equal("acc", db.Model.GetDefaultSchema());
    }

    // ---------- csproj reference graph (generic over all modules) ----------

    [Fact]
    public void ModuleInnerLayers_HaveNoHostOrCrystalReferences()
    {
        var innerProjects = ModuleProjects()
            .Where(p => !IsBootstrapProject(p))
            .ToList();

        Assert.NotEmpty(innerProjects);

        var violations = innerProjects
            .SelectMany(p => ProjectReferences(p).Where(IsHostOrCrystalReference), (p, r) => $"{FileName(p)} -> {r}")
            .ToList();

        Assert.True(violations.Count == 0,
            "Module inner layers must not reference the host or Crystal project: " + string.Join("; ", violations));
    }

    [Fact]
    public void ModuleSourceBoundaries_KeepOuterLayersIndependent()
    {
        var violations = new List<string>();

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesDirectory))
        {
            var moduleName = Path.GetFileName(moduleDirectory);
            var presentationDirectory = Path.Combine(moduleDirectory, $"ErpSystem.Modules.{moduleName}.Presentation");
            var applicationDirectory = Path.Combine(moduleDirectory, $"ErpSystem.Modules.{moduleName}.Application");

            foreach (var sourceFile in Directory.Exists(presentationDirectory)
                         ? Directory.GetFiles(presentationDirectory, "*.cs", SearchOption.AllDirectories)
                         : [])
            {
                var source = File.ReadAllText(sourceFile);
                if (source.Contains($"ErpSystem.Modules.{moduleName}.Domain", StringComparison.Ordinal)
                    || source.Contains($"ErpSystem.Modules.{moduleName}.Infrastructure", StringComparison.Ordinal))
                    violations.Add($"{sourceFile} must not import its Domain or Infrastructure layer.");
            }

            foreach (var sourceFile in Directory.Exists(applicationDirectory)
                         ? Directory.GetFiles(applicationDirectory, "*.cs", SearchOption.AllDirectories)
                         : [])
            {
                var source = File.ReadAllText(sourceFile);
                if (source.Contains($"ErpSystem.Modules.{moduleName}.Infrastructure", StringComparison.Ordinal)
                    || source.Contains($"ErpSystem.Modules.{moduleName}.Presentation", StringComparison.Ordinal))
                    violations.Add($"{sourceFile} must not import its Infrastructure or Presentation layer.");
            }
        }

        Assert.True(violations.Count == 0, string.Join(Environment.NewLine, violations));
    }

    [Fact]
    public void EveryModule_ContainsExactlyTheCanonicalSixProjects()
    {
        var moduleDirectories = Directory.GetDirectories(ModulesDirectory);
        Assert.NotEmpty(moduleDirectories);

        foreach (var moduleDirectory in moduleDirectories)
        {
            var moduleName = Path.GetFileName(moduleDirectory);
            var expected = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                $"{moduleName}/ErpSystem.Modules.{moduleName}.Contracts/ErpSystem.Modules.{moduleName}.Contracts.csproj",
                $"{moduleName}/ErpSystem.Modules.{moduleName}.Domain/ErpSystem.Modules.{moduleName}.Domain.csproj",
                $"{moduleName}/ErpSystem.Modules.{moduleName}.Application/ErpSystem.Modules.{moduleName}.Application.csproj",
                $"{moduleName}/ErpSystem.Modules.{moduleName}.Infrastructure/ErpSystem.Modules.{moduleName}.Infrastructure.csproj",
                $"{moduleName}/ErpSystem.Modules.{moduleName}.Presentation/ErpSystem.Modules.{moduleName}.Presentation.csproj",
                $"{moduleName}/ErpSystem.Modules.{moduleName}/ErpSystem.Modules.{moduleName}.csproj"
            };
            var actual = Directory.GetFiles(moduleDirectory, "*.csproj", SearchOption.AllDirectories)
                .Select(path => Path.GetRelativePath(ModulesDirectory, path).Replace('\\', '/'))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            Assert.Equal(6, actual.Count);
            Assert.True(expected.SetEquals(actual),
                $"Module {moduleName} must contain exactly the canonical six projects. Actual: {string.Join(", ", actual)}");
        }
    }

    [Fact]
    public void EveryModule_HasMatchingDocumentationPackage()
    {
        Assert.True(Directory.Exists(ModuleDocumentationDirectory),
            $"Missing module documentation root: {ModuleDocumentationDirectory}");

        var requiredFiles = new[]
        {
            "module.json", "README.md", "ARCHITECTURE.md", "DELIVERY-ROADMAP.md",
            "api/README.md", "web-next/README.md", "mobile-react/README.md", "features/README.md",
            "phases/README.md"
        };

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesDirectory))
        {
            var moduleName = Path.GetFileName(moduleDirectory);
            var docSlug = ToDocumentationSlug(moduleName);
            var documentationRoot = Path.Combine(ModuleDocumentationDirectory, docSlug);
            Assert.True(Directory.Exists(documentationRoot),
                $"Module {moduleName} must have documentation/modules/{docSlug}.");

            foreach (var relativePath in requiredFiles)
                Assert.True(File.Exists(Path.Combine(documentationRoot, relativePath)),
                    $"Module {moduleName} is missing documentation file {relativePath}.");

            using var moduleJson = JsonDocument.Parse(File.ReadAllText(Path.Combine(documentationRoot, "module.json")));
            var root = moduleJson.RootElement;
            Assert.Equal(moduleName, root.GetProperty("moduleName").GetString());
            Assert.Equal(docSlug, root.GetProperty("docSlug").GetString());

            var context = Directory.GetFiles(moduleDirectory, "*DbContext.cs", SearchOption.AllDirectories)
                .SingleOrDefault(path => !path.Contains("bin", StringComparison.OrdinalIgnoreCase)
                                      && !path.Contains("obj", StringComparison.OrdinalIgnoreCase));
            Assert.NotNull(context);
            var schemaMatch = Regex.Match(
                File.ReadAllText(context!),
                @"public const string Schema = ""(?<schema>[a-z][a-z0-9_]*)""");
            Assert.True(schemaMatch.Success, $"Could not determine schema for module {moduleName}.");
            Assert.Equal(schemaMatch.Groups["schema"].Value, root.GetProperty("databaseSchema").GetString());
        }
    }

    [Fact]
    public void ModuleLayerReferences_FollowAllowedDirections()
    {
        var violations = new List<string>();

        foreach (var project in ModuleProjects())
        {
            var fileName = FileName(project);
            var moduleName = ModuleNameOf(project);
            var projectDir = Path.GetDirectoryName(project)!;
            var references = ProjectReferences(project)
                .Select(include => Path.GetFullPath(Path.Combine(projectDir, include)))
                .ToList();
            var layer = LayerOf(fileName);

            switch (layer)
            {
                case "Domain":
                    if (references.Count != 0)
                        violations.Add($"{fileName} must have no ProjectReference, found: {string.Join(", ", references.Select(FileName))}");
                    break;
                case "Contracts":
                    if (references.Any(reference =>
                            !FileName(reference).Equals(
                                "ErpSystem.BuildingBlocks.Messaging.csproj",
                                StringComparison.OrdinalIgnoreCase)))
                    {
                        violations.Add(
                            $"{fileName} Contracts may only reference BuildingBlocks.Messaging, found: {string.Join(", ", references.Select(FileName))}");
                    }
                    break;
                case "Application":
                    ExpectApplicationReferences(violations, fileName, references, moduleName);
                    break;
                case "Infrastructure":
                    ExpectOwnReferences(
                        violations, fileName, references, moduleName,
                        required: [$"ErpSystem.Modules.{moduleName}.Application"],
                        allowed:
                        [
                            $"ErpSystem.Modules.{moduleName}.Application",
                            $"ErpSystem.Modules.{moduleName}.Contracts",
                            $"ErpSystem.Modules.{moduleName}.Domain"
                        ],
                        allowedBuildingBlocks:
                        [
                            "ErpSystem.BuildingBlocks.Authorization",
                            "ErpSystem.BuildingBlocks.Context",
                            "ErpSystem.BuildingBlocks.Messaging"
                        ]);
                    break;
                case "Presentation":
                    ExpectOwnReferences(
                        violations, fileName, references, moduleName,
                        required:
                        [
                            $"ErpSystem.Modules.{moduleName}.Application",
                            $"ErpSystem.Modules.{moduleName}.Contracts"
                        ],
                        allowed:
                        [
                            $"ErpSystem.Modules.{moduleName}.Application",
                            $"ErpSystem.Modules.{moduleName}.Contracts"
                        ],
                        allowedBuildingBlocks:
                        [
                            "ErpSystem.BuildingBlocks.Authorization",
                            "ErpSystem.BuildingBlocks.Context"
                        ],
                        allowOtherModuleContracts: true);
                    break;
                case "Bootstrap":
                    ExpectBootstrapReferences(violations, fileName, references, moduleName);
                    break;
            }
        }

        Assert.True(violations.Count == 0, string.Join(Environment.NewLine, violations));
    }

    [Fact]
    public void EveryModuleApplication_ReferencesSharedApplicationPipeline()
    {
        foreach (var project in ModuleProjects()
                     .Where(path => FileName(path).EndsWith(".Application.csproj", StringComparison.OrdinalIgnoreCase)))
        {
            var references = ProjectReferences(project)
                .Select(include => Path.GetFullPath(Path.Combine(Path.GetDirectoryName(project)!, include)))
                .Select(FileName)
                .ToList();

            Assert.Contains(
                "ErpSystem.BuildingBlocks.Application.csproj",
                references,
                StringComparer.OrdinalIgnoreCase);
        }
    }

    [Fact]
    public void EveryModuleApplication_RegistersSharedApplicationPipeline()
    {
        foreach (var moduleDirectory in Directory.GetDirectories(ModulesDirectory))
        {
            var moduleName = Path.GetFileName(moduleDirectory);
            var applicationDirectory = Path.Combine(
                moduleDirectory,
                $"ErpSystem.Modules.{moduleName}.Application");
            var registrations = Directory.GetFiles(applicationDirectory, "*DependencyInjection.cs", SearchOption.AllDirectories);

            Assert.NotEmpty(registrations);
            Assert.Contains(
                registrations,
                path => File.ReadAllText(path).Contains("AddApplicationPipeline()", StringComparison.Ordinal));
        }
    }

    [Fact]
    public void ModulePresentation_UsesAspNetCoreFrameworkReference()
    {
        var presentations = ModuleProjects()
            .Where(p => FileName(p).EndsWith(".Presentation.csproj", StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.NotEmpty(presentations);

        foreach (var project in presentations)
        {
            var doc = XDocument.Load(project);
            var hasFrameworkRef = doc.Descendants("FrameworkReference")
                .Any(e => string.Equals(
                    e.Attribute("Include")?.Value, "Microsoft.AspNetCore.App", StringComparison.Ordinal));
            Assert.True(hasFrameworkRef, $"{FileName(project)} must reference the Microsoft.AspNetCore.App framework.");
        }
    }

    // ---------- central package management ----------

    [Fact]
    public void CentralPackageManagement_IsCompleteUniqueAndScoped()
    {
        var centralPath = Path.Combine(ApiDirectory, "Directory.Packages.props");
        Assert.True(File.Exists(centralPath), $"Missing central package policy: {centralPath}");

        var central = XDocument.Load(centralPath);
        var packageVersions = central.Descendants("PackageVersion")
            .Select(e => (Id: (string?)e.Attribute("Include"), Version: (string?)e.Attribute("Version")))
            .ToList();

        Assert.NotEmpty(packageVersions);
        Assert.DoesNotContain(packageVersions, package =>
            string.IsNullOrWhiteSpace(package.Id) || string.IsNullOrWhiteSpace(package.Version));
        Assert.Equal(
            packageVersions.Count,
            packageVersions.Select(package => package.Id).Distinct(StringComparer.OrdinalIgnoreCase).Count());

        var solution = ReadSolutionProjects(File.ReadAllText(Path.Combine(ApiDirectory, "ErpSystem.sln")));
        var erpProjects = solution.Values
            .Where(project => project.Name.StartsWith("ErpSystem.", StringComparison.OrdinalIgnoreCase))
            .Select(project => Path.GetFullPath(Path.Combine(
                ApiDirectory,
                project.RelativePath.Replace('\\', Path.DirectorySeparatorChar))))
            .Where(File.Exists)
            .ToList();
        Assert.NotEmpty(erpProjects);

        var centralIds = packageVersions
            .Select(package => package.Id!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var violations = new List<string>();
        foreach (var project in erpProjects)
        {
            var document = XDocument.Load(project);
            foreach (var packageReference in document.Descendants("PackageReference"))
            {
                var id = (string?)packageReference.Attribute("Include") ?? "<missing Include>";
                if (packageReference.Attribute("Version") is not null
                    || packageReference.Attribute("VersionOverride") is not null
                    || packageReference.Element("Version") is not null
                    || packageReference.Element("VersionOverride") is not null)
                    violations.Add($"{Path.GetFileName(project)} has a local version on {id}.");
                if (!centralIds.Contains(id))
                    violations.Add($"{Path.GetFileName(project)} references {id}, but it has no unique central PackageVersion.");
            }
        }

        Assert.Empty(violations);

        // MSBuild evaluation is the effective contract: ERP solution projects
        // opt in, while the explicitly independent projects remain opted out.
        foreach (var project in erpProjects)
            Assert.Equal("true", EvaluateMsBuildProperty(project, "ManagePackageVersionsCentrally"));

        foreach (var project in new[]
                 {
                     Path.Combine(ApiDirectory, "ErpSystem.AttendanceConnector", "ErpSystem.AttendanceConnector.csproj")
                 }.Where(File.Exists))
            Assert.Equal("false", EvaluateMsBuildProperty(project, "ManagePackageVersionsCentrally"));

        Assert.Equal(
            "false",
            central.Descendants("CentralPackageVersionOverrideEnabled").Single().Value,
            ignoreCase: true);
        Assert.Equal(
            "false",
            central.Descendants("CentralPackageTransitivePinningEnabled").Single().Value,
            ignoreCase: true);
    }

    [Fact]
    public void ApiHost_ReferencesOnlySharedBuildingBlocksAndAllModuleBootstraps()
    {
        var apiCsproj = Path.Combine(ApiDirectory, "ErpSystem.Api", "ErpSystem.Api.csproj");
        var apiDir = Path.GetDirectoryName(apiCsproj)!;
        var referencedPaths = ProjectReferences(apiCsproj)
            .Select(include => Path.GetFullPath(Path.Combine(apiDir, include)))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var buildingBlockPaths = Directory
            .GetFiles(Path.Combine(ApiDirectory, "BuildingBlocks"), "*.csproj", SearchOption.AllDirectories)
            .Select(Path.GetFullPath)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        Assert.NotEmpty(buildingBlockPaths);

        var bootstrapPaths = ModuleProjects()
            .Select(Path.GetFullPath)
            .Where(p => LayerOf(FileName(p)) == "Bootstrap")
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        Assert.NotEmpty(bootstrapPaths);

        var missingBootstraps = bootstrapPaths.Except(referencedPaths).ToArray();
        Assert.Empty(missingBootstraps);

        var nonBootstrapReferences = referencedPaths.Except(bootstrapPaths).ToArray();
        var invalidReferences = nonBootstrapReferences
            .Where(reference => !buildingBlockPaths.Contains(reference))
            .ToArray();
        Assert.True(invalidReferences.Length == 0,
            "API host may reference shared BuildingBlocks plus every module bootstrap, "
            + $"but not module internals. Invalid: {string.Join("; ", invalidReferences)}");
    }

    [Theory]
    [InlineData(null, "true", true)]
    [InlineData(null, "false", false)]
    [InlineData("true", "false", true)]
    [InlineData("false", "true", false)]
    public void ModuleMigrationSettings_ResolvesModuleOverrideThenFallback(
        string? moduleOverride,
        string fallback,
        bool expected)
    {
        var values = new Dictionary<string, string?>
        {
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = fallback
        };
        if (moduleOverride is not null)
            values["Modules:HR:Database:ApplyMigrationsOnStartup"] = moduleOverride;

        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();
        Assert.Equal(expected, ModuleMigrationSettings.ShouldApplyMigrations(configuration, "HR"));
    }

    [Fact]
    public void ModuleMigrationSettings_RejectsInvalidModuleOverride()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Modules:HR:Database:ApplyMigrationsOnStartup"] = "sometimes",
                ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true"
            })
            .Build();

        var exception = Assert.Throws<InvalidOperationException>(() =>
            ModuleMigrationSettings.ShouldApplyMigrations(configuration, "HR"));

        Assert.Contains("Modules:HR:Database:ApplyMigrationsOnStartup", exception.Message);
        Assert.Contains("sometimes", exception.Message);
    }

    [Fact]
    public void ModuleMigrationSettings_RejectsInvalidFallback()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DatabaseSettings:ApplyMigrationsOnStartup"] = "sometimes"
            })
            .Build();

        var exception = Assert.Throws<InvalidOperationException>(() =>
            ModuleMigrationSettings.ShouldApplyMigrations(configuration, "HR"));

        Assert.Contains("DatabaseSettings:ApplyMigrationsOnStartup", exception.Message);
        Assert.Contains("sometimes", exception.Message);
    }

    [Fact]
    public void ApiHost_ContainsNoBusinessControllersOrFeatureTree()
    {
        var apiRoot = Path.Combine(ApiDirectory, "ErpSystem.Api");
        Assert.False(Directory.Exists(Path.Combine(apiRoot, "Features")));
        Assert.Empty(Directory.GetFiles(apiRoot, "*Controller.cs", SearchOption.AllDirectories));
    }

    // ---------- ERP solution identity and Visual Studio layout ----------

    [Fact]
    public void ErpSystemSolution_UsesErpDisplayNamesAndSolutionFolderType()
    {
        var solutionPath = Path.Combine(ApiDirectory, "ErpSystem.sln");
        Assert.True(File.Exists(solutionPath), $"Expected solution file at {solutionPath}.");

        var solution = File.ReadAllText(solutionPath);
        Assert.False(
            solution.Contains("215E1984-446E-4A63-AA33-6D3E9797319A", StringComparison.OrdinalIgnoreCase),
            "The legacy incompatible solution-folder project type must not be present.");

        var projects = ReadSolutionProjects(solution);
        // Every expected project and folder is derived from the module directories
        // on disk, so adding a module without updating this test fails loudly.
        var moduleNames = Directory.GetDirectories(ModulesDirectory)
            .Select(Path.GetFileName)
            .OfType<string>()
            .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
            .ToList();
        Assert.NotEmpty(moduleNames);

        var expectedNames = new List<string>
        {
            "ErpSystem.Api",
            "ErpSystem.Tests",
        };
        expectedNames.AddRange(Directory
            .GetFiles(Path.Combine(ApiDirectory, "BuildingBlocks"), "*.csproj", SearchOption.AllDirectories)
            .Select(Path.GetFileNameWithoutExtension)
            .OfType<string>());
        foreach (var moduleName in moduleNames)
        {
            expectedNames.Add($"ErpSystem.Modules.{moduleName}.Contracts");
            expectedNames.Add($"ErpSystem.Modules.{moduleName}.Domain");
            expectedNames.Add($"ErpSystem.Modules.{moduleName}.Application");
            expectedNames.Add($"ErpSystem.Modules.{moduleName}.Infrastructure");
            expectedNames.Add($"ErpSystem.Modules.{moduleName}.Presentation");
            expectedNames.Add($"ErpSystem.Modules.{moduleName}");
        }

        foreach (var expectedName in expectedNames)
            Assert.True(projects.ContainsKey(expectedName), $"Missing solution project {expectedName}.");

        var expectedFolders = new List<string> { "BuildingBlocks", "Modules" };
        expectedFolders.AddRange(moduleNames);
        foreach (var folderName in expectedFolders)
        {
            Assert.True(projects.TryGetValue(folderName, out var folder), $"Missing solution folder {folderName}.");
            Assert.True(
                string.Equals(folder!.TypeGuid, "{2150E333-8FDC-42A3-9474-1A3956D46DE8}", StringComparison.OrdinalIgnoreCase),
                $"Solution folder {folderName} must use the Visual Studio solution-folder type GUID.");
        }
    }

    [Fact]
    public void ErpSystemSolution_NestsEveryModuleUnderModules()
    {
        var solution = File.ReadAllText(Path.Combine(ApiDirectory, "ErpSystem.sln"));
        var projects = ReadSolutionProjects(solution);
        var nested = ReadNestedProjects(solution);

        var moduleNames = Directory.GetDirectories(ModulesDirectory)
            .Select(Path.GetFileName)
            .OfType<string>()
            .ToList();
        Assert.NotEmpty(moduleNames);

        foreach (var moduleName in moduleNames)
        {
            AssertNested(projects, nested, moduleName, "Modules");
            AssertNested(projects, nested, $"ErpSystem.Modules.{moduleName}.Contracts", moduleName);
            AssertNested(projects, nested, $"ErpSystem.Modules.{moduleName}.Domain", moduleName);
            AssertNested(projects, nested, $"ErpSystem.Modules.{moduleName}.Application", moduleName);
            AssertNested(projects, nested, $"ErpSystem.Modules.{moduleName}.Infrastructure", moduleName);
            AssertNested(projects, nested, $"ErpSystem.Modules.{moduleName}.Presentation", moduleName);
            AssertNested(projects, nested, $"ErpSystem.Modules.{moduleName}", moduleName);
        }

        foreach (var buildingBlockName in Directory
                     .GetFiles(Path.Combine(ApiDirectory, "BuildingBlocks"), "*.csproj", SearchOption.AllDirectories)
                     .Select(Path.GetFileNameWithoutExtension)
                     .OfType<string>())
        {
            AssertNested(projects, nested, buildingBlockName, "BuildingBlocks");
        }

        foreach (var rootProject in new[] { "ErpSystem.Api", "ErpSystem.Tests" })
            Assert.DoesNotContain(projects[rootProject].Id, nested.Keys);
    }

    [Fact]
    public void ErpSystemProjects_DeclareMatchingAssemblyAndRootNamespace()
    {
        var solutionPath = Path.Combine(ApiDirectory, "ErpSystem.sln");
        var projects = ReadSolutionProjects(File.ReadAllText(solutionPath));

        foreach (var project in projects.Values.Where(project =>
                     project.Name.StartsWith("ErpSystem.", StringComparison.OrdinalIgnoreCase)))
        {
            var projectPath = Path.GetFullPath(Path.Combine(
                ApiDirectory,
                project.RelativePath.Replace('\\', Path.DirectorySeparatorChar)));

            Assert.True(File.Exists(projectPath), $"Missing project file for {project.Name}: {projectPath}.");
            AssertProjectIdentity(projectPath, project.Name);
            Assert.Equal(project.Name, Path.GetFileNameWithoutExtension(projectPath));
            Assert.Equal(project.Name, Path.GetFileName(Path.GetDirectoryName(projectPath)));
            Assert.DoesNotContain("HrManagementSystem", project.RelativePath, StringComparison.OrdinalIgnoreCase);
        }

        var attendanceProjectPath = Path.Combine(
            ApiDirectory,
            "ErpSystem.AttendanceConnector",
            "ErpSystem.AttendanceConnector.csproj");
        AssertProjectIdentity(attendanceProjectPath, "ErpSystem.AttendanceConnector");
    }

    // ---------- explicit host composition ----------

    [Fact]
    public void ErpModuleRegistry_RegistersEveryModuleDirectoryExactlyOnce()
    {
        var onDisk = Directory.GetDirectories(ModulesDirectory)
            .Select(Path.GetFileName)
            .OfType<string>()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        Assert.NotEmpty(onDisk);

        var first = ErpSystem.Api.Modules.ErpModuleRegistry.Create();
        var second = ErpSystem.Api.Modules.ErpModuleRegistry.Create();

        // Deterministic composition: every call returns the same names in the
        // same order, with no shared mutable state.
        Assert.Equal(
            first.Select(m => m.Name),
            second.Select(m => m.Name));
        Assert.DoesNotContain(first, m => m is null);

        var registeredNames = first.Select(m => m.Name).ToList();
        Assert.Equal(
            registeredNames.Count,
            registeredNames.ToHashSet(StringComparer.OrdinalIgnoreCase).Count);

        // Registry identity must match the module directory it was scaffolded from.
        foreach (var name in registeredNames)
            Assert.True(onDisk.Contains(name), $"Registered module '{name}' has no api/Modules directory.");
        foreach (var directory in onDisk)
            Assert.Contains(directory, registeredNames, StringComparer.OrdinalIgnoreCase);
    }

    [Fact]
    public void PlatformModule_IsTechnicalAndNotTenantFacing()
    {
        var platform = ErpSystem.Api.Modules.ErpModuleRegistry.Create()
            .Single(module => string.Equals(module.Definition.Code, "platform", StringComparison.OrdinalIgnoreCase))
            .Definition;

        Assert.False(platform.IsUserVisible);
        Assert.False(platform.AllowsTenantEntitlement);
        Assert.False(platform.IsDefault);
    }

    // ---------- module scaffolder ----------

    [Fact]
    public void ModuleScaffolder_RejectsInvalidModuleName_WithoutWriting()
    {
        var script = ScaffolderScriptPath();
        var before = Directory.GetDirectories(ModulesDirectory)
            .Select(Path.GetFileName)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var result = RunScaffolder(script, "-ModuleName bad-name -ApiRoot \"" + ApiDirectory + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Equal(
            before,
            Directory.GetDirectories(ModulesDirectory)
                .Select(Path.GetFileName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase));
    }

    [Fact]
    public void ModuleScaffolder_RejectsExistingModule_WithoutWriting()
    {
        var script = ScaffolderScriptPath();
        var registryBefore = File.ReadAllText(RegistryPath());
        var hostBefore = File.ReadAllText(HostCsprojPath());

        // Accounting passes name validation and exists on disk, so the run
        // must fail at the existence gate without touching anything.
        var result = RunScaffolder(script, "-ModuleName Accounting -ApiRoot \"" + ApiDirectory + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("already exists", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(registryBefore, File.ReadAllText(RegistryPath()));
        Assert.Equal(hostBefore, File.ReadAllText(HostCsprojPath()));
    }

    [Theory]
    [InlineData("POS")]
    [InlineData("RetailPOS")]
    public void ModuleScaffolder_RejectsAbbreviatedModuleName_WithoutWriting(string moduleName)
    {
        var script = ScaffolderScriptPath();
        var before = Directory.GetDirectories(ModulesDirectory)
            .Select(Path.GetFileName)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var registryBefore = File.ReadAllText(RegistryPath());
        var hostBefore = File.ReadAllText(HostCsprojPath());

        // All-uppercase and trailing-uppercase abbreviations fail parameter
        // binding before any write (for example POS and RetailPOS).
        var result = RunScaffolder(script, "-ModuleName " + moduleName + " -ApiRoot \"" + ApiDirectory + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("abbreviation", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(
            before,
            Directory.GetDirectories(ModulesDirectory)
                .Select(Path.GetFileName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase));
        Assert.Equal(registryBefore, File.ReadAllText(RegistryPath()));
        Assert.Equal(hostBefore, File.ReadAllText(HostCsprojPath()));
    }

    [Fact]
    public void ApiHost_ModuleReferencesUseStableMarkers()
    {
        var host = File.ReadAllText(HostCsprojPath());

        Assert.Equal(1, CountOccurrences(host, "<!-- <erp-module-references> -->"));
        Assert.Equal(1, CountOccurrences(host, "<!-- </erp-module-references> -->"));

        var begin = host.IndexOf("<!-- <erp-module-references> -->", StringComparison.Ordinal);
        var end = host.IndexOf("<!-- </erp-module-references> -->", StringComparison.Ordinal);
        Assert.True(begin >= 0 && end > begin);

        // Every module bootstrap reference lives between the markers so the
        // scaffolder can insert textually without XML reserialization.
        var marked = host.Substring(begin, end - begin);
        foreach (var moduleName in Directory.GetDirectories(ModulesDirectory)
                     .Select(Path.GetFileName)
                     .OfType<string>())
        {
            Assert.Contains($"ErpSystem.Modules.{moduleName}.csproj", marked);
        }

        var registry = File.ReadAllText(RegistryPath());
        const string registryBegin = "// <erp-module-registrations>";
        const string registryEnd = "// </erp-module-registrations>";
        Assert.Equal(1, CountOccurrences(registry, registryBegin));
        Assert.Equal(1, CountOccurrences(registry, registryEnd));

        var registryStart = registry.IndexOf(registryBegin, StringComparison.Ordinal);
        var registryStop = registry.IndexOf(registryEnd, StringComparison.Ordinal);
        Assert.True(registryStart >= 0 && registryStop > registryStart);
        var registered = registry.Substring(registryStart, registryStop - registryStart);
        foreach (var moduleName in Directory.GetDirectories(ModulesDirectory)
                     .Select(Path.GetFileName)
                     .OfType<string>())
        {
            Assert.Contains($"ErpSystem.Modules.{moduleName}.{moduleName}Module", registered);
        }
    }

    [Fact]
    public void ModuleScaffolder_WhatIf_ChangesNothing()
    {
        var script = ScaffolderScriptPath();
        var registryBefore = File.ReadAllText(RegistryPath());
        var hostBefore = File.ReadAllText(HostCsprojPath());

        var result = RunScaffolder(
            script,
            "-ModuleName PointOfSale -ApiRoot \"" + ApiDirectory + "\" -WhatIf");

        Assert.Equal(0, result.ExitCode);
        Assert.False(Directory.Exists(Path.Combine(ModulesDirectory, "PointOfSale")));
        Assert.False(Directory.Exists(Path.Combine(ModuleDocumentationDirectory, "point-of-sale")));
        Assert.Equal(registryBefore, File.ReadAllText(RegistryPath()));
        Assert.Equal(hostBefore, File.ReadAllText(HostCsprojPath()));
    }

    [Theory]
    [InlineData("Hr", "hr")]
    [InlineData("PointOfSale", "point-of-sale")]
    public void ModuleScaffolder_UsesStableDocumentationSlug(string moduleName, string expectedSlug)
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);

        var result = RunScaffolder(
            ScaffolderScriptPath(),
            "-ModuleName " + moduleName + " -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.Equal(0, result.ExitCode);
        Assert.True(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules", expectedSlug)));
    }

    [Fact]
    public void ModuleScaffolder_RequiresCentralPackagePolicyBeforeWriting()
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);
        var centralPath = Path.Combine(workspace.ApiRoot, "Directory.Packages.props");
        File.Delete(centralPath);

        var result = RunScaffolder(
            ScaffolderScriptPath(),
            "-ModuleName PointOfSale -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("Central package policy not found", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "PointOfSale")));
        Assert.False(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale")));
    }

    [Fact]
    public void ModuleScaffolder_RejectsIncompleteCentralPackagePolicyBeforeWriting()
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);
        File.WriteAllText(
            Path.Combine(workspace.ApiRoot, "Directory.Packages.props"),
            "<Project><PropertyGroup><ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>"
            + "<CentralPackageVersionOverrideEnabled>false</CentralPackageVersionOverrideEnabled></PropertyGroup>"
            + "<ItemGroup><PackageVersion Include=\"MediatR\" Version=\"12.5.0\" /></ItemGroup></Project>");

        var result = RunScaffolder(
            ScaffolderScriptPath(),
            "-ModuleName PointOfSale -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains(
            "must define exactly one version for 'FluentValidation'",
            result.Output,
            StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "PointOfSale")));
        Assert.False(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale")));
    }

    [Fact]
    public void ModuleScaffolder_RejectsDisabledCentralPackageManagementBeforeWriting()
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);
        File.WriteAllText(
            Path.Combine(workspace.ApiRoot, "Directory.Packages.props"),
            "<Project><PropertyGroup><ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>"
            + "<CentralPackageVersionOverrideEnabled>false</CentralPackageVersionOverrideEnabled></PropertyGroup>"
            + "<ItemGroup>"
            + "<PackageVersion Include=\"MediatR\" Version=\"12.5.0\" />"
            + "<PackageVersion Include=\"FluentValidation\" Version=\"12.1.1\" />"
            + "<PackageVersion Include=\"FluentValidation.DependencyInjectionExtensions\" Version=\"12.1.1\" />"
            + "<PackageVersion Include=\"Microsoft.EntityFrameworkCore.SqlServer\" Version=\"10.0.9\" />"
            + "<PackageVersion Include=\"Microsoft.EntityFrameworkCore.Design\" Version=\"10.0.9\" />"
            + "<PackageVersion Include=\"Asp.Versioning.Mvc\" Version=\"8.1.0\" />"
            + "</ItemGroup></Project>");

        var result = RunScaffolder(
            ScaffolderScriptPath(),
            "-ModuleName PointOfSale -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains(
            "must enable ManagePackageVersionsCentrally",
            result.Output,
            StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "PointOfSale")));
        Assert.False(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale")));
    }

    [Fact]
    public void ModuleScaffolder_RequiresDocumentationRootBeforeWriting()
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);
        var documentationRoot = Path.Combine(workspace.Root, "documentation", "modules");
        Directory.Delete(documentationRoot, recursive: true);

        var result = RunScaffolder(
            ScaffolderScriptPath(),
            "-ModuleName PointOfSale -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("Module documentation root not found", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "PointOfSale")));
        Assert.False(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale")));
    }

    [Fact]
    public void ModuleScaffolder_RejectsDocumentationCollisionBeforeWriting()
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);
        var documentationTarget = Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale");
        Directory.CreateDirectory(documentationTarget);
        var sentinelPath = Path.Combine(documentationTarget, "README.md");
        const string sentinel = "pre-existing documentation must survive";
        File.WriteAllText(sentinelPath, sentinel);

        var result = RunScaffolder(
            ScaffolderScriptPath(),
            "-ModuleName PointOfSale -ApiRoot \"" + workspace.ApiRoot + "\"",
            workspace.StubBin);

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("documentation directory already exists", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "PointOfSale")));
        Assert.Equal(sentinel, File.ReadAllText(sentinelPath));
    }

    [Fact]
    public void ModuleScaffolder_HappyPath_CreatesCanonicalModuleInIsolatedWorkspace()
    {
        var script = ScaffolderScriptPath();
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 0);
        var fakeApi = workspace.ApiRoot;

        var result = RunScaffolder(
            script,
            "-ModuleName PointOfSale -ApiRoot \"" + fakeApi + "\"",
            workspace.StubBin);

        Assert.True(result.ExitCode == 0, "Scaffolder failed in isolated workspace: " + result.Output);
        var centralPolicy = File.ReadAllText(Path.Combine(fakeApi, "Directory.Packages.props"));
        Assert.Contains("ManagePackageVersionsCentrally", centralPolicy, StringComparison.Ordinal);

        var moduleRoot = Path.Combine(fakeApi, "Modules", "PointOfSale");
        var documentationRoot = Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale");
        foreach (var relativePath in new[]
                 {
                     "module.json", "README.md", "ARCHITECTURE.md", "DELIVERY-ROADMAP.md",
                     "api/README.md", "web-next/README.md", "mobile-react/README.md", "features/README.md",
                     "phases/README.md"
                 })
            Assert.True(File.Exists(Path.Combine(documentationRoot, relativePath)),
                $"Missing generated documentation file {relativePath}.");

        using (var moduleJson = JsonDocument.Parse(File.ReadAllText(Path.Combine(documentationRoot, "module.json"))))
        {
            var root = moduleJson.RootElement;
            Assert.Equal("PointOfSale", root.GetProperty("moduleName").GetString());
            Assert.Equal("point-of-sale", root.GetProperty("docSlug").GetString());
            Assert.Equal("pos", root.GetProperty("databaseSchema").GetString());
            Assert.Equal("1.0.0", root.GetProperty("version").GetString());
            Assert.Empty(root.GetProperty("requiredModuleDependencies").EnumerateArray());
            Assert.Empty(root.GetProperty("optionalModuleDependencies").EnumerateArray());
            Assert.True(root.GetProperty("isUserVisible").GetBoolean());
            Assert.True(root.GetProperty("allowsTenantEntitlement").GetBoolean());
            Assert.Equal("foundation", root.GetProperty("status").GetString());
            Assert.Equal("api/Modules/PointOfSale", root.GetProperty("runtimePaths").GetProperty("root").GetString());
            Assert.Equal("documentation/modules/point-of-sale", root.GetProperty("documentationPaths").GetProperty("root").GetString());
            Assert.Equal("documentation/modules/point-of-sale/phases/README.md", root.GetProperty("documentationPaths").GetProperty("phases").GetString());
        }
        var generatedReadme = File.ReadAllText(Path.Combine(documentationRoot, "README.md"));
        Assert.Contains("`documentation/system/`", generatedReadme, StringComparison.Ordinal);
        Assert.Contains("reuse", generatedReadme, StringComparison.OrdinalIgnoreCase);
        var generatedArchitecture = File.ReadAllText(Path.Combine(documentationRoot, "ARCHITECTURE.md"));
        Assert.Contains("`ErpSystem.Modules.PointOfSale.PointOfSaleModule`", generatedArchitecture, StringComparison.Ordinal);
        Assert.Contains("`pos`", generatedArchitecture, StringComparison.Ordinal);
        Assert.Contains("reuse-first", generatedArchitecture, StringComparison.OrdinalIgnoreCase);
        foreach (var layer in new[] { "Contracts", "Domain", "Application", "Infrastructure", "Presentation" })
        {
            var projectName = $"ErpSystem.Modules.PointOfSale.{layer}";
            var csproj = Path.Combine(moduleRoot, projectName, projectName + ".csproj");
            Assert.True(File.Exists(csproj), $"Missing generated project {csproj}.");
            AssertProjectIdentity(csproj, projectName);
            Assert.DoesNotContain(" Version=", File.ReadAllText(csproj), StringComparison.Ordinal);
        }
        AssertProjectIdentity(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale", "ErpSystem.Modules.PointOfSale.csproj"),
            "ErpSystem.Modules.PointOfSale");
        var generatedInfrastructure = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Infrastructure", "ErpSystem.Modules.PointOfSale.Infrastructure.csproj"));
        Assert.DoesNotContain(" Version=", generatedInfrastructure, StringComparison.Ordinal);
        Assert.Contains("<PrivateAssets>all</PrivateAssets>", generatedInfrastructure, StringComparison.Ordinal);
        var generatedPresentation = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Presentation", "ErpSystem.Modules.PointOfSale.Presentation.csproj"));
        Assert.Contains("<PackageReference Include=\"Asp.Versioning.Mvc\" />", generatedPresentation, StringComparison.Ordinal);
        Assert.Contains("ErpSystem.BuildingBlocks.Authorization.csproj", generatedPresentation, StringComparison.Ordinal);
        Assert.DoesNotContain(" Version=", generatedPresentation, StringComparison.Ordinal);
        var generatedApplication = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Application", "ErpSystem.Modules.PointOfSale.Application.csproj"));
        Assert.Contains("ErpSystem.BuildingBlocks.Application.csproj", generatedApplication, StringComparison.Ordinal);
        var generatedApplicationDi = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Application", "DependencyInjection.cs"));
        Assert.Contains("services.AddApplicationPipeline();", generatedApplicationDi, StringComparison.Ordinal);

        var dbContext = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Infrastructure", "PointOfSaleDbContext.cs"));
        Assert.Contains("public const string Schema = \"pos\"", dbContext);
        // Cached configuration detection mirrors AccountingDbContext so a
        // fresh module keeps EF model checks quiet until its first entity.
        Assert.Contains("HasEntityConfigurations", dbContext);
        Assert.Contains("IEntityTypeConfiguration<>", dbContext);
        Assert.Contains("if (HasEntityConfigurations)", dbContext);
        var designFactory = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Infrastructure", "PointOfSaleDbContextDesignFactory.cs"));
        var moduleConnectionIndex = designFactory.IndexOf("ConnectionStrings__PointOfSale", StringComparison.Ordinal);
        var defaultConnectionIndex = designFactory.IndexOf("ConnectionStrings__DefaultConnection", StringComparison.Ordinal);
        Assert.True(moduleConnectionIndex >= 0, "Generated design-time factory must resolve the module-specific connection.");
        Assert.True(defaultConnectionIndex > moduleConnectionIndex,
            "Generated design-time factory must fall back to DefaultConnection after the module-specific connection.");
        var infraDi = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale.Infrastructure", "DependencyInjection.cs"));
        Assert.Contains("GetConnectionString(\"PointOfSale\")", infraDi);
        Assert.Contains("GetConnectionString(\"DefaultConnection\")", infraDi);

        var bootstrap = File.ReadAllText(
            Path.Combine(moduleRoot, "ErpSystem.Modules.PointOfSale", "PointOfSaleModule.cs"));
        Assert.Contains("public string Name => \"PointOfSale\"", bootstrap);
        Assert.Contains("public ModuleDefinition Definition => new(\"point-of-sale\", \"PointOfSale\", [])", bootstrap);
        Assert.Contains("Version = \"1.0.0\"", bootstrap);

        // The module schema must exist before EF creates the module history
        // table, so schema bootstrap precedes the GetMigrations() inspection.
        var ensureIndex = bootstrap.IndexOf("ExecuteSqlRawAsync(EnsureSchemaSql", StringComparison.Ordinal);
        var migrationsIndex = bootstrap.IndexOf("GetMigrations()", StringComparison.Ordinal);
        Assert.True(ensureIndex >= 0, "Generated bootstrap must ensure the module schema.");
        Assert.True(migrationsIndex >= 0, "Generated bootstrap must inspect defined migrations.");
        Assert.True(ensureIndex < migrationsIndex, "Generated bootstrap must ensure the schema before GetMigrations().");
        Assert.Contains("GetPendingMigrationsAsync", bootstrap);

        var registry = File.ReadAllText(
            Path.Combine(fakeApi, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs"));
        Assert.Contains("new ErpSystem.Modules.PointOfSale.PointOfSaleModule(),", registry);

        var host = File.ReadAllText(
            Path.Combine(fakeApi, "ErpSystem.Api", "ErpSystem.Api.csproj"));
        Assert.Contains("ErpSystem.Modules.PointOfSale.csproj", host);

        var log = File.ReadAllText(workspace.DotnetLog);
        foreach (var layer in new[] { "Contracts", "Domain", "Application", "Infrastructure", "Presentation", "" })
        {
            var projectName = string.IsNullOrEmpty(layer)
                ? "ErpSystem.Modules.PointOfSale"
                : $"ErpSystem.Modules.PointOfSale.{layer}";
            Assert.Contains(projectName, log);
        }
        Assert.Contains("Modules/PointOfSale", log.Replace('\\', '/'));
    }

    [Fact]
    public void ModuleScaffolder_RollsBackWhenSolutionAttachFails()
    {
        using var workspace = CreateIsolatedWorkspace(dotnetExitCode: 1);
        var fakeApi = workspace.ApiRoot;
        var script = ScaffolderScriptPath();

        var solutionBefore = File.ReadAllBytes(Path.Combine(fakeApi, "ErpSystem.sln"));
        var hostBefore = File.ReadAllBytes(Path.Combine(fakeApi, "ErpSystem.Api", "ErpSystem.Api.csproj"));
        var registryBefore = File.ReadAllBytes(
            Path.Combine(fakeApi, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs"));

        var result = RunScaffolder(
            script,
            "-ModuleName PointOfSale -ApiRoot \"" + fakeApi + "\"",
            workspace.StubBin);

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("dotnet sln add failed", result.Output, StringComparison.OrdinalIgnoreCase);

        // The module root created by this run is gone...
        Assert.False(Directory.Exists(Path.Combine(fakeApi, "Modules", "PointOfSale")));
        // ...and the docs package is gone while its pre-existing ownership root remains.
        Assert.False(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules", "point-of-sale")));
        Assert.True(Directory.Exists(Path.Combine(workspace.Root, "documentation", "modules")));
        // ...and host, registry, and solution are byte-for-byte identical.
        Assert.Equal(solutionBefore, File.ReadAllBytes(Path.Combine(fakeApi, "ErpSystem.sln")));
        Assert.Equal(hostBefore, File.ReadAllBytes(Path.Combine(fakeApi, "ErpSystem.Api", "ErpSystem.Api.csproj")));
        Assert.Equal(registryBefore, File.ReadAllBytes(
            Path.Combine(fakeApi, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs")));
    }

    private sealed class IsolatedWorkspace : IDisposable
    {
        public string Root { get; }
        public string ApiRoot { get; }
        public string StubBin { get; }
        public string DotnetLog { get; }

        public IsolatedWorkspace(string root, string apiRoot, string stubBin, string dotnetLog)
        {
            Root = root;
            ApiRoot = apiRoot;
            StubBin = stubBin;
            DotnetLog = dotnetLog;
        }

        public void Dispose()
        {
            try { Directory.Delete(Root, recursive: true); } catch { }
        }
    }

    private static IsolatedWorkspace CreateIsolatedWorkspace(int dotnetExitCode)
    {
        var root = Path.Combine(Path.GetTempPath(), "ErpModuleScaffold", Guid.NewGuid().ToString("N"));
        var fakeApi = Path.Combine(root, "api");
        var stubBin = Path.Combine(root, "stubbin");
        Directory.CreateDirectory(fakeApi);
        Directory.CreateDirectory(stubBin);
        Directory.CreateDirectory(Path.Combine(fakeApi, "Modules"));
        Directory.CreateDirectory(Path.Combine(fakeApi, "ErpSystem.Api", "Modules"));
        Directory.CreateDirectory(Path.Combine(root, "documentation", "modules"));

        // Keep the fixture's policy identical to api/ so the generator's
        // preflight and generated versionless references are exercised.
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

        // Stub dotnet records solution operations with a fixed exit code.
        var dotnetLog = Path.Combine(root, "dotnet.log");
        var dotnetStubPath = Path.Combine(stubBin, OperatingSystem.IsWindows() ? "dotnet.cmd" : "dotnet");
        if (OperatingSystem.IsWindows())
        {
            File.WriteAllText(
                dotnetStubPath,
                "@echo off\r\nset args=%*\r\n"
                + "echo %args%>> \"" + dotnetLog + "\"\r\n"
                + $"exit /b {dotnetExitCode}\r\n");
        }
        else
        {
            // PowerShell resolves an executable named dotnet on Unix, while
            // Windows resolves dotnet.cmd. Quote the log path for POSIX sh and
            // escape embedded single quotes defensively.
            var escapedLogPath = dotnetLog.Replace("'", "'\"'\"'");
            File.WriteAllText(
                dotnetStubPath,
                "#!/bin/sh\n"
                + "printf '%s\\n' \"$*\" >> '" + escapedLogPath + "'\n"
                + $"exit {dotnetExitCode}\n");
            File.SetUnixFileMode(
                dotnetStubPath,
                UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute
                | UnixFileMode.GroupRead | UnixFileMode.GroupExecute
                | UnixFileMode.OtherRead | UnixFileMode.OtherExecute);
        }

        return new IsolatedWorkspace(root, fakeApi, stubBin, dotnetLog);
    }

    private static int CountOccurrences(string text, string value)
    {
        var count = 0;
        var index = 0;
        while ((index = text.IndexOf(value, index, StringComparison.Ordinal)) >= 0)
        {
            count++;
            index += value.Length;
        }

        return count;
    }

    private static string ScaffolderScriptPath()
    {
        var script = Path.Combine(ApiDirectory, "scripts", "New-ErpModule.ps1");
        Assert.True(File.Exists(script), $"Missing module scaffolder at {script}.");
        return script;
    }

    private static string RegistryPath() =>
        Path.Combine(ApiDirectory, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs");

    private static string HostCsprojPath() =>
        Path.Combine(ApiDirectory, "ErpSystem.Api", "ErpSystem.Api.csproj");

    private sealed record ScaffolderResult(int ExitCode, string Output);

    private static ScaffolderResult RunScaffolder(string script, string arguments, string? prependToPath = null)
    {
        var shell = FindPowerShell();
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = shell,
                Arguments = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \"" + script + "\" " + arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            }
        };
        if (prependToPath is not null)
            process.StartInfo.Environment["PATH"] = prependToPath + Path.PathSeparator + process.StartInfo.Environment["PATH"];

        var output = new System.Text.StringBuilder();
        process.OutputDataReceived += (_, e) => { if (e.Data is not null) output.AppendLine(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (e.Data is not null) output.AppendLine(e.Data); };
        Assert.True(process.Start(), "Could not start PowerShell to run the module scaffolder.");
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        Assert.True(process.WaitForExit(180000), "Module scaffolder timed out after 180 seconds.");
        // The first WaitForExit only waits for the process. The second call
        // flushes the asynchronous stdout/stderr event handlers before the
        // output is asserted by the caller.
        process.WaitForExit();
        return new ScaffolderResult(process.ExitCode, output.ToString());
    }

    private static string FindPowerShell()
    {
        foreach (var candidate in new[] { "pwsh", "powershell" })
        {
            try
            {
                var probe = Process.Start(new ProcessStartInfo
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
            catch { }
        }

        Assert.Fail("No PowerShell (pwsh/powershell) available to run the module scaffolder.");
        throw new InvalidOperationException("Unreachable: Assert.Fail always throws.");
    }

    private static string EvaluateMsBuildProperty(string projectPath, string propertyName)
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "dotnet",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };
        process.StartInfo.ArgumentList.Add("msbuild");
        process.StartInfo.ArgumentList.Add(projectPath);
        process.StartInfo.ArgumentList.Add("-nologo");
        process.StartInfo.ArgumentList.Add($"-getProperty:{propertyName}");
        Assert.True(process.Start(), $"Could not start dotnet msbuild for {projectPath}.");
        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();
        Assert.True(process.WaitForExit(120000), $"dotnet msbuild timed out for {projectPath}.");
        Assert.Equal(0, process.ExitCode);

        try
        {
            if (!output.TrimStart().StartsWith("{", StringComparison.Ordinal))
                return output.Trim();

            using var document = JsonDocument.Parse(output);
            return document.RootElement
                .GetProperty("Properties")
                .GetProperty(propertyName)
                .GetString() ?? string.Empty;
        }
        catch (Exception exception)
        {
            throw new Xunit.Sdk.XunitException(
                $"Could not parse MSBuild property {propertyName} for {projectPath}. Output: {output} Error: {error} {exception.Message}");
        }
    }

    private static void AssertProjectIdentity(string projectPath, string expectedIdentity)
    {
        Assert.True(File.Exists(projectPath), $"Expected project file at {projectPath}.");

        var document = XDocument.Load(projectPath);
        var propertyGroup = document.Root?.Elements("PropertyGroup").FirstOrDefault(group =>
            group.Element("AssemblyName") is not null || group.Element("RootNamespace") is not null);

        Assert.NotNull(propertyGroup);
        Assert.Equal(expectedIdentity, propertyGroup!.Element("AssemblyName")?.Value);
        Assert.Equal(expectedIdentity, propertyGroup.Element("RootNamespace")?.Value);
    }

    private static Dictionary<string, SolutionProject> ReadSolutionProjects(string solution)
    {
        const string pattern =
            "^Project\\(\\\"(?<type>\\{[^\\\"]+\\})\\\"\\) = \\\"(?<name>[^\\\"]+)\\\", \\\"(?<path>[^\\\"]+)\\\", \\\"(?<id>\\{[^\\\"]+\\})\\\"";

        return Regex.Matches(solution, pattern, RegexOptions.Multiline)
            .Select(match => new SolutionProject(
                match.Groups["type"].Value,
                match.Groups["name"].Value,
                match.Groups["path"].Value,
                match.Groups["id"].Value))
            .ToDictionary(project => project.Name, StringComparer.OrdinalIgnoreCase);
    }

    private static Dictionary<string, string> ReadNestedProjects(string solution)
    {
        const string pattern = "^\\s*(?<child>\\{[^}]+\\})\\s*=\\s*(?<parent>\\{[^}]+\\})\\s*$";

        return Regex.Matches(solution, pattern, RegexOptions.Multiline)
            .Select(match => (Child: match.Groups["child"].Value, Parent: match.Groups["parent"].Value))
            .ToDictionary(pair => pair.Child, pair => pair.Parent, StringComparer.OrdinalIgnoreCase);
    }

    private static void AssertNested(
        IReadOnlyDictionary<string, SolutionProject> projects,
        IReadOnlyDictionary<string, string> nested,
        string childName,
        string parentName)
    {
        Assert.True(nested.TryGetValue(projects[childName].Id, out var parentId),
            $"{childName} is not nested under a solution folder.");
        Assert.Equal(projects[parentName].Id, parentId);
    }

    private sealed record SolutionProject(string TypeGuid, string Name, string RelativePath, string Id);

    // ---------- helpers ----------

    private static void ExpectApplicationReferences(
        List<string> violations,
        string fileName,
        List<string> resolvedReferences,
        string moduleName)
    {
        var moduleRoot = Path.GetFullPath(Path.Combine(ModulesDirectory, moduleName));
        var ownContracts = $"ErpSystem.Modules.{moduleName}.Contracts";
        var ownDomain = $"ErpSystem.Modules.{moduleName}.Domain";
        const string applicationBuildingBlock = "ErpSystem.BuildingBlocks.Application";
        var referencedNames = resolvedReferences
            .Select(Path.GetFileNameWithoutExtension)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var required in new[] { ownContracts, ownDomain, applicationBuildingBlock })
        {
            if (!referencedNames.Contains(required))
                violations.Add($"{fileName} must reference its own {required}.");
        }

        foreach (var reference in resolvedReferences)
        {
            var referencedFile = Path.GetFileNameWithoutExtension(reference);
            var isOwn = reference.StartsWith(moduleRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);
            var isBuildingBlock = reference.StartsWith(
                Path.Combine(ApiDirectory, "BuildingBlocks") + Path.DirectorySeparatorChar,
                StringComparison.OrdinalIgnoreCase);
            var isOtherModuleContracts = !isOwn
                && reference.StartsWith(ModulesDirectory + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                && FileName(reference).EndsWith(".Contracts.csproj", StringComparison.OrdinalIgnoreCase);

            if (isOwn)
            {
                if (!referencedFile.Equals(ownContracts, StringComparison.OrdinalIgnoreCase)
                    && !referencedFile.Equals(ownDomain, StringComparison.OrdinalIgnoreCase))
                    violations.Add($"{fileName} has unexpected own-module reference to {referencedFile}.");
            }
            else if (!isOtherModuleContracts && !isBuildingBlock)
            {
                violations.Add($"{fileName} may only reference BuildingBlocks or another module's Contracts, found: {reference}.");
            }
        }
    }

    private static void ExpectOwnReferences(
        List<string> violations,
        string fileName,
        List<string> resolvedReferences,
        string moduleName,
        string[] required,
        string[] allowed,
        string[]? allowedBuildingBlocks = null,
        bool allowOtherModuleContracts = false)
    {
        var moduleRoot = Path.GetFullPath(Path.Combine(ModulesDirectory, moduleName));
        var buildingBlocksRoot = Path.GetFullPath(Path.Combine(ApiDirectory, "BuildingBlocks"));
        var referencedNames = resolvedReferences
            .Select(Path.GetFileNameWithoutExtension)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var requiredName in required)
        {
            if (!referencedNames.Contains(requiredName))
                violations.Add($"{fileName} must reference its own {requiredName}.");
        }

        foreach (var reference in resolvedReferences)
        {
            var referencedFile = Path.GetFileNameWithoutExtension(reference);
            var isAllowedBuildingBlock = allowedBuildingBlocks is not null
                && reference.StartsWith(buildingBlocksRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                && allowedBuildingBlocks.Contains(referencedFile, StringComparer.OrdinalIgnoreCase);
            var isOtherModuleContracts = allowOtherModuleContracts
                && !reference.StartsWith(moduleRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                && reference.StartsWith(ModulesDirectory + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                && FileName(reference).EndsWith(".Contracts.csproj", StringComparison.OrdinalIgnoreCase);

            if (!reference.StartsWith(moduleRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                && !isAllowedBuildingBlock
                && !isOtherModuleContracts)
                violations.Add($"{fileName} must only reference projects inside its own module ({moduleName}): {reference}.");
            else if (!isAllowedBuildingBlock
                     && !isOtherModuleContracts
                     && !allowed.Contains(referencedFile, StringComparer.OrdinalIgnoreCase))
                violations.Add($"{fileName} has unexpected reference to {referencedFile}.");
        }
    }

    private static void ExpectBootstrapReferences(
        List<string> violations,
        string fileName,
        List<string> resolvedReferences,
        string moduleName)
    {
        var allowed = new[]
        {
            "ErpSystem.BuildingBlocks.Modularity",
            $"ErpSystem.Modules.{moduleName}.Application",
            $"ErpSystem.Modules.{moduleName}.Infrastructure",
            $"ErpSystem.Modules.{moduleName}.Presentation"
        };
        var referencedNames = resolvedReferences
            .Select(Path.GetFileNameWithoutExtension)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var requiredName in allowed)
        {
            if (!referencedNames.Contains(requiredName))
                violations.Add($"{fileName} (bootstrap) must reference {requiredName}.");
        }

        foreach (var reference in resolvedReferences)
        {
            var referencedFile = Path.GetFileNameWithoutExtension(reference);
            if (!allowed.Contains(referencedFile, StringComparer.OrdinalIgnoreCase))
                violations.Add($"{fileName} (bootstrap) has unexpected reference to {referencedFile}.");
        }
    }

    private static IEnumerable<string> ModuleProjects()
    {
        if (!Directory.Exists(ModulesDirectory))
            return [];

        return Directory.GetDirectories(ModulesDirectory)
            .SelectMany(moduleDirectory =>
                Directory.GetFiles(moduleDirectory, "*.csproj", SearchOption.AllDirectories));
    }

    private static string LayerOf(string fileName) =>
        fileName.EndsWith(".Contracts.csproj", StringComparison.OrdinalIgnoreCase) ? "Contracts"
        : fileName.EndsWith(".Domain.csproj", StringComparison.OrdinalIgnoreCase) ? "Domain"
        : fileName.EndsWith(".Application.csproj", StringComparison.OrdinalIgnoreCase) ? "Application"
        : fileName.EndsWith(".Infrastructure.csproj", StringComparison.OrdinalIgnoreCase) ? "Infrastructure"
        : fileName.EndsWith(".Presentation.csproj", StringComparison.OrdinalIgnoreCase) ? "Presentation"
        : "Bootstrap";

    private static bool IsBootstrapProject(string projectPath) =>
        LayerOf(FileName(projectPath)) == "Bootstrap";

    private static string ModuleNameOf(string projectPath)
    {
        var relative = Path.GetRelativePath(ModulesDirectory, projectPath);
        return relative.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)[0];
    }

    private static IEnumerable<string> ProjectReferences(string csprojPath)
    {
        var doc = XDocument.Load(csprojPath);
        return doc.Descendants("ProjectReference")
            .Select(e => e.Attribute("Include")?.Value)
            .OfType<string>()
            .ToList();
    }

    private static bool IsHostOrCrystalReference(string include) =>
        include.Contains("ErpSystem.Api.csproj", StringComparison.OrdinalIgnoreCase)
        || include.Contains("CrystalReportGeneratorApi", StringComparison.OrdinalIgnoreCase);

    private static string FileName(string path) => Path.GetFileName(path);

    private static string ToDocumentationSlug(string moduleName)
    {
        if (moduleName.Equals("HR", StringComparison.OrdinalIgnoreCase))
            return "hr";

        return Regex.Replace(moduleName, "(?<!^)([A-Z])", "-$1").ToLowerInvariant();
    }

    [Fact]
    public void ModuleCatalog_RejectsNullModules()
    {
        Assert.Throws<ArgumentException>(() =>
            new ModuleCatalog([new StubModule("Accounting"), null!]));
    }

    [Fact]
    public void ModuleCatalog_RejectsInvalidNames()
    {
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new StubModule("Bad Name")]));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new StubModule("1Accounting")]));
    }

    [Fact]
    public void ModuleCatalog_RejectsNullSource()
    {
        Assert.Throws<ArgumentNullException>(() => new ModuleCatalog(null!));
    }

    [Fact]
    public void ModuleCatalog_AcceptsOneShotEnumerables()
    {
        var catalog = new ModuleCatalog(new SingleUseEnumerable<IModule>(
            [new StubModule("First"), new StubModule("Second")]));

        Assert.Equal(["First", "Second"], catalog.Modules.Select(m => m.Name));
    }

    [Fact]
    public void AccountingModule_EnsureSchemaSql_UsesConstantSchemaOnly()
    {
        Assert.Equal(
            "IF SCHEMA_ID(N'acc') IS NULL EXEC(N'CREATE SCHEMA [acc]');",
            AccountingModule.EnsureSchemaSql);
    }

    [Fact]
    public void AccountingModel_AppliesInfrastructureConfigurations()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=(local);Database=ModularityTests;Trusted_Connection=True;"
            })
            .Build();

        var services = new ServiceCollection();
        services.AddAccountingInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();

        // Building the model runs OnModelCreating end to end, including
        // ApplyConfigurationsFromAssembly, so a broken scan fails here.
        Assert.NotNull(db.Model);

        var configuredEntityTypes = typeof(AccountingDbContext).Assembly
            .GetTypes()
            .Where(t => t.GetInterfaces().Any(i =>
                i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)))
            .SelectMany(t => t.GetInterfaces()
                .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>))
                .Select(i => i.GetGenericArguments()[0]))
            .ToList();

        foreach (var entityType in configuredEntityTypes)
            Assert.NotNull(db.Model.FindEntityType(entityType));
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

        public void MapEndpoints(IEndpointRouteBuilder endpoints) =>
            log?.Add($"map:{Name}");

        public void ConfigureEarlyApplication(WebApplication app) =>
            log?.Add($"early:{Name}");

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
        public IServiceProvider ServiceProvider => new ServiceCollection().BuildServiceProvider();
        public ICollection<EndpointDataSource> DataSources => new List<EndpointDataSource>();
        public IApplicationBuilder CreateApplicationBuilder() => new ApplicationBuilder(new ServiceCollection().BuildServiceProvider());
    }
}
