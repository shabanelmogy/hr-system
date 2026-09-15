using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class SolutionStructureTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ModulesRoot = Path.Combine(ApiRoot, "Modules");

    [Fact]
    public void ApiGuidance_HasOneCanonicalFeatureWorkflowAndNoRetiredEntryPoints()
    {
        var repositoryRoot = Directory.GetParent(ApiRoot)!.FullName;
        var documentationRoot = Path.Combine(repositoryRoot, "documentation", "api");
        var workflow = Path.Combine(documentationRoot, "API_FEATURE_DEVELOPMENT_WORKFLOW.md");
        var workflowClosure = Path.Combine(documentationRoot, "API_DEVELOPMENT_WORKFLOW_CLOSURE.md");
        var agents = File.ReadAllText(Path.Combine(ApiRoot, "AGENTS.md"));
        var rootAgents = File.ReadAllText(Path.Combine(repositoryRoot, "AGENTS.md"));
        var documentationIndex = File.ReadAllText(Path.Combine(repositoryRoot, "documentation", "README.md"));
        var documentationSystemRoot = Path.Combine(repositoryRoot, "documentation", "system");
        var documentationSystemReadme = File.ReadAllText(Path.Combine(documentationSystemRoot, "README.md"));
        var documentationSystemAgents = File.ReadAllText(Path.Combine(documentationSystemRoot, "AGENTS.md"));
        var implementationRequestTemplate = File.ReadAllText(Path.Combine(
            documentationSystemRoot,
            "templates",
            "FEATURE-IMPLEMENTATION-REQUEST.template.md"));
        var phaseZeroTemplate = File.ReadAllText(Path.Combine(
            documentationSystemRoot,
            "templates",
            "PHASE-00-discovery-evidence.template.md"));
        var generatedPhaseZero = File.ReadAllText(Path.Combine(
            documentationSystemRoot,
            "generated",
            "PHASE-00-discovery-evidence.md"));
        var newFeatureGenerator = File.ReadAllText(Path.Combine(
            documentationSystemRoot,
            "New-FeatureDocumentation.ps1"));

        Assert.True(File.Exists(workflow), "The canonical API feature workflow must exist.");
        Assert.True(File.Exists(workflowClosure), "The API development-workflow closure record must exist.");
        Assert.Contains("API_FEATURE_DEVELOPMENT_WORKFLOW.md", agents, StringComparison.Ordinal);
        Assert.Contains("API_FEATURE_DEVELOPMENT_WORKFLOW.md", rootAgents, StringComparison.Ordinal);
        Assert.Contains("API_FEATURE_DEVELOPMENT_WORKFLOW.md", documentationIndex, StringComparison.Ordinal);

        var workflowText = File.ReadAllText(workflow);
        var workflowClosureText = File.ReadAllText(workflowClosure);
        Assert.Contains("Existing-System Relationship Review", workflowText, StringComparison.Ordinal);
        Assert.Contains("Business Readiness Gate", workflowText, StringComparison.Ordinal);
        Assert.Contains("Business Rules Matrix", workflowText, StringComparison.Ordinal);
        Assert.Contains("Edge Cases & Validation Matrix", workflowText, StringComparison.Ordinal);
        Assert.Contains("Impact Matrix", workflowText, StringComparison.Ordinal);
        Assert.Contains("FluentValidation does not replace Domain invariants", workflowText, StringComparison.Ordinal);
        Assert.Contains("Definition of Done", workflowText, StringComparison.Ordinal);
        Assert.Contains("API development-workflow / Business Readiness phase is CLOSED", workflowClosureText, StringComparison.Ordinal);
        Assert.Contains("807 passed", workflowClosureText, StringComparison.Ordinal);
        Assert.Contains("77/77", workflowClosureText, StringComparison.Ordinal);

        foreach (var requiredSection in new[]
                 {
                     "Business Rules Matrix",
                     "Edge Cases & Validation Matrix",
                     "Impact Matrix"
                 })
        {
            Assert.Contains(requiredSection, implementationRequestTemplate, StringComparison.Ordinal);
            Assert.Contains(requiredSection, phaseZeroTemplate, StringComparison.Ordinal);
            Assert.Contains(requiredSection, generatedPhaseZero, StringComparison.Ordinal);
            Assert.Contains(requiredSection, documentationSystemReadme, StringComparison.Ordinal);
            Assert.Contains(requiredSection, documentationSystemAgents, StringComparison.Ordinal);
        }

        Assert.Contains("API_FEATURE_DEVELOPMENT_WORKFLOW.md", implementationRequestTemplate, StringComparison.Ordinal);
        Assert.Contains("Existing-System Relationship Review", implementationRequestTemplate, StringComparison.Ordinal);
        Assert.Contains("implementation cannot begin", phaseZeroTemplate, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Existing-System Relationship Review", generatedPhaseZero, StringComparison.Ordinal);
        Assert.Contains("all three Business Readiness matrices", newFeatureGenerator, StringComparison.Ordinal);

        Assert.False(File.Exists(Path.Combine(documentationRoot, "Feature_Module_Implementation_Checklist.md")));
        Assert.False(File.Exists(Path.Combine(documentationRoot, "ERP_ARCHITECTURE_REVIEW_MATRIX.md")));
        Assert.False(File.Exists(Path.Combine(documentationRoot, "Entity_Implementation_Guide.md")));
        Assert.False(File.Exists(Path.Combine(documentationRoot, "Enhancement_Points.md")));
        Assert.False(File.Exists(Path.Combine(documentationRoot, "Simplify_Outbox_To_Hangfire_Prompt.md")));
    }

    [Fact]
    public void EveryModule_HasSixRuntimeProjectsAndOneOwnedTestProject()
    {
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var expected = ExpectedModuleProjects(module)
                .Select(Path.GetFullPath)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var actual = Directory.GetFiles(moduleRoot, "*.csproj", SearchOption.AllDirectories)
                .Where(IsSourceProject)
                .Select(Path.GetFullPath)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            Assert.True(
                expected.SetEquals(actual),
                $"Module {module} must contain six runtime projects and one owned test project. "
                + $"Expected: {string.Join(", ", expected.Select(Path.GetFileName))}. "
                + $"Actual: {string.Join(", ", actual.Select(Path.GetFileName))}.");
        }
    }

    [Fact]
    public void ModuleRuntimeProjectReferences_FollowCleanArchitectureDirections()
    {
        var violations = new List<string>();

        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            foreach (var project in RuntimeProjects(module))
                ValidateRuntimeReferences(module, project, violations);
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void ModuleOwnedTests_ReferenceOtherBusinessModulesThroughContractsOnly()
    {
        var violations = new List<string>();

        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var testProject = TestProject(module);
            var testDirectory = Path.GetDirectoryName(testProject)!;

            foreach (var include in ProjectReferences(testProject))
            {
                var target = Path.GetFullPath(Path.Combine(testDirectory, include));
                var relative = Path.GetRelativePath(ModulesRoot, target);
                if (relative.StartsWith("..", StringComparison.Ordinal))
                    continue; // technical BuildingBlocks are allowed when explicitly needed.

                var referencedModule = relative.Split(
                    Path.DirectorySeparatorChar,
                    Path.AltDirectorySeparatorChar)[0];
                if (!referencedModule.Equals(module, StringComparison.OrdinalIgnoreCase)
                    && !LayerOf(target).Equals("Contracts", StringComparison.Ordinal))
                {
                    violations.Add(
                        $"{Path.GetFileName(testProject)} -> {target}: cross-module test references must target Contracts only.");
                }
            }
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void BuildingBlocks_DoNotReferenceBusinessModules()
    {
        var buildingBlocksRoot = Path.Combine(ApiRoot, "BuildingBlocks");
        var violations = new List<string>();

        foreach (var project in Directory.GetFiles(buildingBlocksRoot, "*.csproj", SearchOption.AllDirectories)
                     .Where(IsSourceProject))
        {
            var projectDirectory = Path.GetDirectoryName(project)!;
            foreach (var include in ProjectReferences(project))
            {
                var target = Path.GetFullPath(Path.Combine(projectDirectory, include));
                if (IsUnder(target, ModulesRoot))
                    violations.Add($"{Path.GetFileName(project)} -> {Path.GetFileName(target)}");
            }
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void ApiHost_ReferencesOnlyBuildingBlocksAndModuleBootstraps()
    {
        var project = Path.Combine(ApiRoot, "ErpSystem.Api", "ErpSystem.Api.csproj");
        var projectDirectory = Path.GetDirectoryName(project)!;
        var violations = new List<string>();

        foreach (var include in ProjectReferences(project))
        {
            var target = Path.GetFullPath(Path.Combine(projectDirectory, include));
            var isBuildingBlock = IsUnder(target, Path.Combine(ApiRoot, "BuildingBlocks"));
            var isModuleBootstrap = IsUnder(target, ModulesRoot)
                && Path.GetFileNameWithoutExtension(target) is var name
                && !name.EndsWith(".Contracts", StringComparison.OrdinalIgnoreCase)
                && !name.EndsWith(".Domain", StringComparison.OrdinalIgnoreCase)
                && !name.EndsWith(".Application", StringComparison.OrdinalIgnoreCase)
                && !name.EndsWith(".Infrastructure", StringComparison.OrdinalIgnoreCase)
                && !name.EndsWith(".Presentation", StringComparison.OrdinalIgnoreCase)
                && !name.EndsWith(".Tests", StringComparison.OrdinalIgnoreCase);

            if (!isBuildingBlock && !isModuleBootstrap)
                violations.Add($"ErpSystem.Api -> {target}");
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void ApiHost_ReferencesEveryModuleBootstrap_AndMarkersStayStable()
    {
        var hostProject = Path.Combine(ApiRoot, "ErpSystem.Api", "ErpSystem.Api.csproj");
        var hostDirectory = Path.GetDirectoryName(hostProject)!;
        var referencedProjects = ProjectReferences(hostProject)
            .Select(include => Path.GetFullPath(Path.Combine(hostDirectory, include)))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var bootstrap = RuntimeProjects(module)
                .Single(project => LayerOf(project) == "Bootstrap");
            Assert.Contains(Path.GetFullPath(bootstrap), referencedProjects);
        }

        var hostSource = File.ReadAllText(hostProject);
        Assert.Equal(1, CountOccurrences(hostSource, "<!-- <erp-module-references> -->"));
        Assert.Equal(1, CountOccurrences(hostSource, "<!-- </erp-module-references> -->"));

        var registryPath = Path.Combine(ApiRoot, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs");
        var registry = File.ReadAllText(registryPath);
        const string registryBegin = "// <erp-module-registrations>";
        const string registryEnd = "// </erp-module-registrations>";
        Assert.Equal(1, CountOccurrences(registry, registryBegin));
        Assert.Equal(1, CountOccurrences(registry, registryEnd));

        var start = registry.IndexOf(registryBegin, StringComparison.Ordinal);
        var end = registry.IndexOf(registryEnd, StringComparison.Ordinal);
        Assert.True(start >= 0 && end > start);
        var markedRegistry = registry[start..end];
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            Assert.Contains($"new ErpSystem.Modules.{module}.", markedRegistry, StringComparison.Ordinal);
        }
    }

    [Fact]
    public void Solution_NestsEachModuleAndItsSevenProjectsUnderModules()
    {
        var solution = File.ReadAllText(Path.Combine(ApiRoot, "ErpSystem.sln"));
        var projects = Regex.Matches(
                solution,
                "Project\\(\"\\{[^}]+\\}\"\\) = \"(?<name>[^\"]+)\", \"[^\"]+\", \"(?<id>\\{[^}]+\\})\"")
            .Select(match => (Name: match.Groups["name"].Value, Id: match.Groups["id"].Value))
            .ToDictionary(item => item.Name, item => item.Id, StringComparer.OrdinalIgnoreCase);
        var nested = Regex.Matches(
                solution,
                "(?m)^\\s*(?<child>\\{[0-9A-Fa-f-]+\\})\\s*=\\s*(?<parent>\\{[0-9A-Fa-f-]+\\})\\s*$")
            .Select(match => (Child: match.Groups["child"].Value, Parent: match.Groups["parent"].Value))
            .ToDictionary(item => item.Child, item => item.Parent, StringComparer.OrdinalIgnoreCase);

        Assert.True(projects.TryGetValue("Modules", out var modulesFolder), "Solution folder 'Modules' is missing.");
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            Assert.True(projects.TryGetValue(module, out var moduleFolder), $"Solution folder '{module}' is missing.");
            Assert.True(nested.TryGetValue(moduleFolder!, out var moduleParent));
            Assert.Equal(modulesFolder, moduleParent, ignoreCase: true);

            foreach (var projectPath in ExpectedModuleProjects(module))
            {
                var projectName = Path.GetFileNameWithoutExtension(projectPath);
                Assert.True(projects.TryGetValue(projectName, out var projectId), $"Solution project '{projectName}' is missing.");
                Assert.True(nested.TryGetValue(projectId!, out var projectParent), $"Solution project '{projectName}' is not nested.");
                Assert.Equal(moduleFolder, projectParent, ignoreCase: true);
            }
        }
    }

    [Fact]
    public void ModuleDocumentationPackages_MapExplicitlyToRuntimeModules()
    {
        var documentationRoot = Path.Combine(Directory.GetParent(ApiRoot)!.FullName, "documentation", "modules");
        var manifests = Directory.GetFiles(documentationRoot, "module.json", SearchOption.AllDirectories);
        Assert.NotEmpty(manifests);

        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var expectedRuntimeRoot = $"api/Modules/{module}";
            var matches = manifests.Where(path =>
            {
                using var document = JsonDocument.Parse(File.ReadAllText(path));
                var runtimeRoot = document.RootElement
                    .GetProperty("runtimePaths")
                    .GetProperty("root")
                    .GetString();
                return string.Equals(runtimeRoot?.Replace('\\', '/'), expectedRuntimeRoot, StringComparison.OrdinalIgnoreCase);
            }).ToArray();

            var manifestPath = Assert.Single(matches);
            using var manifest = JsonDocument.Parse(File.ReadAllText(manifestPath));
            var root = manifest.RootElement;
            Assert.Equal(module, root.GetProperty("moduleName").GetString(), ignoreCase: true);

            var dbContextSource = Directory.GetFiles(
                    Path.Combine(moduleRoot, $"ErpSystem.Modules.{module}.Infrastructure"),
                    "*DbContext.cs",
                    SearchOption.AllDirectories)
                .Single(path => IsSourceProject(path));
            var schemaMatch = Regex.Match(
                File.ReadAllText(dbContextSource),
                "public const string Schema = \\\"(?<schema>[a-z][a-z0-9_]*)\\\"");
            Assert.True(schemaMatch.Success, $"Could not determine schema for module {module}.");
            Assert.Equal(schemaMatch.Groups["schema"].Value, root.GetProperty("databaseSchema").GetString());

            var documentationDirectory = Path.GetDirectoryName(manifestPath)!;
            foreach (var relative in new[]
                     {
                         "README.md", "ARCHITECTURE.md", "DELIVERY-ROADMAP.md",
                         "api/README.md", "web-next/README.md", "mobile-react/README.md",
                         "features/README.md", "phases/README.md"
                     })
            {
                Assert.True(
                    File.Exists(Path.Combine(documentationDirectory, relative.Replace('/', Path.DirectorySeparatorChar))),
                    $"Module {module} documentation is missing {relative}.");
            }
        }
    }

    [Fact]
    public void NoTestProject_HidesSourceWithCompileRemove()
    {
        var violations = Directory.GetFiles(ApiRoot, "*.csproj", SearchOption.AllDirectories)
            .Where(IsSourceProject)
            .Where(IsTestProject)
            .Where(project => XDocument.Load(project).Descendants("Compile")
                .Any(item => item.Attribute("Remove") is not null))
            .Select(project => Path.GetRelativePath(ApiRoot, project))
            .ToArray();

        Assert.Empty(violations);
    }

    [Fact]
    public void SolutionLevelTestOwnershipProjects_Exist()
    {
        Assert.True(File.Exists(Path.Combine(
            ApiRoot, "Tests", "ErpSystem.ArchitectureTests", "ErpSystem.ArchitectureTests.csproj")));
        Assert.True(File.Exists(Path.Combine(
            ApiRoot, "Tests", "ErpSystem.IntegrationTests", "ErpSystem.IntegrationTests.csproj")));
        Assert.True(File.Exists(Path.Combine(
            ApiRoot, "Tests", "ErpSystem.BuildingBlocks.Tests", "ErpSystem.BuildingBlocks.Tests.csproj")));
    }

    [Fact]
    public void LegacyCatchAllTestProject_DoesNotExistOrReturnToSolution()
    {
        var legacyProject = Path.Combine(ApiRoot, "ErpSystem.Tests", "ErpSystem.Tests.csproj");
        Assert.False(File.Exists(legacyProject));

        var solution = File.ReadAllText(Path.Combine(ApiRoot, "ErpSystem.sln"));
        Assert.DoesNotContain(
            "ErpSystem.Tests\\ErpSystem.Tests.csproj",
            solution,
            StringComparison.OrdinalIgnoreCase);
    }

    private static void ValidateRuntimeReferences(string module, string project, List<string> violations)
    {
        var layer = LayerOf(project);
        var projectDirectory = Path.GetDirectoryName(project)!;
        var references = ProjectReferences(project)
            .Select(include => Path.GetFullPath(Path.Combine(projectDirectory, include)))
            .ToArray();

        foreach (var target in references)
        {
            if (IsUnder(target, Path.Combine(ApiRoot, "BuildingBlocks")))
                continue;

            if (!IsUnder(target, ModulesRoot))
            {
                violations.Add($"{Path.GetFileName(project)} references non-module/non-BuildingBlock {target}");
                continue;
            }

            var relative = Path.GetRelativePath(ModulesRoot, target);
            var referencedModule = relative.Split(
                Path.DirectorySeparatorChar,
                Path.AltDirectorySeparatorChar)[0];
            var referencedLayer = LayerOf(target);
            var ownModule = referencedModule.Equals(module, StringComparison.OrdinalIgnoreCase);

            if (!ownModule)
            {
                if (!referencedLayer.Equals("Contracts", StringComparison.Ordinal))
                    violations.Add($"{Path.GetFileName(project)} -> {Path.GetFileName(target)}: cross-module references must target Contracts only.");
                continue;
            }

            var allowed = layer switch
            {
                "Contracts" => Array.Empty<string>(),
                "Domain" => Array.Empty<string>(),
                "Application" => ["Contracts", "Domain"],
                "Infrastructure" => ["Contracts", "Domain", "Application"],
                "Presentation" => ["Contracts", "Application"],
                "Bootstrap" => ["Application", "Infrastructure", "Presentation"],
                _ => Array.Empty<string>()
            };

            if (!allowed.Contains(referencedLayer, StringComparer.Ordinal))
                violations.Add($"{Path.GetFileName(project)} -> {Path.GetFileName(target)} is not allowed for {layer}.");
        }
    }

    private static IEnumerable<string> ExpectedModuleProjects(string module)
    {
        var root = Path.Combine(ModulesRoot, module);
        foreach (var suffix in new[] { "Contracts", "Domain", "Application", "Infrastructure", "Presentation", "Tests" })
        {
            var name = $"ErpSystem.Modules.{module}.{suffix}";
            yield return Path.Combine(root, name, name + ".csproj");
        }

        var bootstrap = $"ErpSystem.Modules.{module}";
        yield return Path.Combine(root, bootstrap, bootstrap + ".csproj");
    }

    private static IEnumerable<string> RuntimeProjects(string module) =>
        ExpectedModuleProjects(module).Where(project => !project.EndsWith(".Tests.csproj", StringComparison.OrdinalIgnoreCase));

    private static string TestProject(string module) =>
        ExpectedModuleProjects(module).Single(project => project.EndsWith(".Tests.csproj", StringComparison.OrdinalIgnoreCase));

    private static IEnumerable<string> ModuleDirectories() =>
        Directory.GetDirectories(ModulesRoot)
            .Where(path => !Path.GetFileName(path).StartsWith('.'))
            .OrderBy(path => path, StringComparer.OrdinalIgnoreCase);

    private static string[] ProjectReferences(string project)
    {
        var document = XDocument.Load(project);
        return document.Descendants("ProjectReference")
            .Select(item => item.Attribute("Include")?.Value)
            .OfType<string>()
            .ToArray();
    }

    private static bool IsTestProject(string project)
    {
        var document = XDocument.Load(project);
        return project.EndsWith(".Tests.csproj", StringComparison.OrdinalIgnoreCase)
            || document.Descendants("IsTestProject").Any(value =>
                value.Value.Equals("true", StringComparison.OrdinalIgnoreCase));
    }

    private static string LayerOf(string project)
    {
        var name = Path.GetFileNameWithoutExtension(project);
        foreach (var layer in new[] { "Contracts", "Domain", "Application", "Infrastructure", "Presentation", "Tests" })
        {
            if (name.EndsWith('.' + layer, StringComparison.OrdinalIgnoreCase))
                return layer;
        }

        return "Bootstrap";
    }

    private static bool IsUnder(string candidate, string root)
    {
        var normalizedRoot = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        return Path.GetFullPath(candidate).StartsWith(normalizedRoot, StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsSourceProject(string path) =>
        !path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        && !path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        && !path.Contains($"{Path.DirectorySeparatorChar}.artifacts{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase);

    private static int CountOccurrences(string value, string token)
    {
        var count = 0;
        for (var index = 0; (index = value.IndexOf(token, index, StringComparison.Ordinal)) >= 0; index += token.Length)
            count++;
        return count;
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
}
