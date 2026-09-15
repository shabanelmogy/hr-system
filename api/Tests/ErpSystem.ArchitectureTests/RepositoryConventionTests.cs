using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class RepositoryConventionTests
{
    private const string SolutionFolderType = "{2150E333-8FDC-42A3-9474-1A3956D46DE8}";
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ModulesRoot = Path.Combine(ApiRoot, "Modules");

    [Fact]
    public void EveryModuleApplication_UsesTheSharedApplicationPipeline()
    {
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var project = Path.Combine(
                moduleRoot,
                $"ErpSystem.Modules.{module}.Application",
                $"ErpSystem.Modules.{module}.Application.csproj");
            var projectDirectory = Path.GetDirectoryName(project)!;
            var references = ProjectReferences(project)
                .Select(include => Path.GetFullPath(Path.Combine(projectDirectory, include)))
                .Select(Path.GetFileName)
                .ToArray();
            Assert.Contains(
                "ErpSystem.BuildingBlocks.Application.csproj",
                references,
                StringComparer.OrdinalIgnoreCase);

            var applicationRoot = Path.GetDirectoryName(project)!;
            Assert.Contains(
                SourceFiles(applicationRoot),
                path => File.ReadAllText(path).Contains("AddApplicationPipeline()", StringComparison.Ordinal));
        }
    }

    [Fact]
    public void EveryModulePresentation_UsesAspNetCoreSharedFramework()
    {
        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var project = Path.Combine(
                moduleRoot,
                $"ErpSystem.Modules.{module}.Presentation",
                $"ErpSystem.Modules.{module}.Presentation.csproj");
            var document = XDocument.Load(project);

            Assert.Contains(
                document.Descendants("FrameworkReference"),
                reference => string.Equals(
                    reference.Attribute("Include")?.Value,
                    "Microsoft.AspNetCore.App",
                    StringComparison.Ordinal));
        }
    }

    [Fact]
    public void ApiHost_ContainsCompositionOnly_NoBusinessControllersOrFeatureTree()
    {
        var hostRoot = Path.Combine(ApiRoot, "ErpSystem.Api");

        Assert.False(Directory.Exists(Path.Combine(hostRoot, "Features")));
        Assert.DoesNotContain(
            SourceFiles(hostRoot),
            path => Path.GetFileName(path).EndsWith("Controller.cs", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void CentralPackageManagement_IsUniqueVersionlessAndCoversSolutionPackages()
    {
        var centralPath = Path.Combine(ApiRoot, "Directory.Packages.props");
        var central = XDocument.Load(centralPath);
        var packageVersions = central.Descendants("PackageVersion")
            .Select(element => (
                Id: (string?)element.Attribute("Include"),
                Version: (string?)element.Attribute("Version")))
            .ToArray();

        Assert.NotEmpty(packageVersions);
        Assert.DoesNotContain(packageVersions, package =>
            string.IsNullOrWhiteSpace(package.Id) || string.IsNullOrWhiteSpace(package.Version));
        Assert.Equal(
            packageVersions.Length,
            packageVersions.Select(package => package.Id).Distinct(StringComparer.OrdinalIgnoreCase).Count());
        Assert.Equal(
            "false",
            Assert.Single(central.Descendants("CentralPackageVersionOverrideEnabled")).Value,
            ignoreCase: true);
        Assert.Equal(
            "false",
            Assert.Single(central.Descendants("CentralPackageTransitivePinningEnabled")).Value,
            ignoreCase: true);

        var centralIds = packageVersions
            .Select(package => package.Id!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var violations = new List<string>();
        foreach (var project in SolutionProjects().Where(project => project.Name.StartsWith("ErpSystem.", StringComparison.Ordinal)))
        {
            var projectPath = Path.Combine(ApiRoot, project.RelativePath.Replace('\\', Path.DirectorySeparatorChar));
            if (!File.Exists(projectPath))
                continue;

            foreach (var packageReference in XDocument.Load(projectPath).Descendants("PackageReference"))
            {
                var id = (string?)packageReference.Attribute("Include") ?? "<missing Include>";
                if (packageReference.Attribute("Version") is not null
                    || packageReference.Attribute("VersionOverride") is not null
                    || packageReference.Element("Version") is not null
                    || packageReference.Element("VersionOverride") is not null)
                    violations.Add($"{project.Name} has a local version for {id}.");
                if (!centralIds.Contains(id))
                    violations.Add($"{project.Name} references {id}, which has no central PackageVersion.");
            }
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void SolutionProjects_UseStableIdentityAndCanonicalSolutionFolderType()
    {
        var solutionText = File.ReadAllText(Path.Combine(ApiRoot, "ErpSystem.sln"));
        Assert.DoesNotContain("215E1984-446E-4A63-AA33-6D3E9797319A", solutionText, StringComparison.OrdinalIgnoreCase);

        foreach (var project in SolutionProjects())
        {
            if (project.TypeGuid.Equals(SolutionFolderType, StringComparison.OrdinalIgnoreCase))
                continue;
            if (!project.Name.StartsWith("ErpSystem.", StringComparison.Ordinal))
                continue;

            var projectPath = Path.GetFullPath(Path.Combine(
                ApiRoot,
                project.RelativePath.Replace('\\', Path.DirectorySeparatorChar)));
            Assert.True(File.Exists(projectPath), $"Missing solution project file for {project.Name}: {projectPath}");
            var document = XDocument.Load(projectPath);
            Assert.Equal(project.Name, Path.GetFileNameWithoutExtension(projectPath));
            Assert.Equal(project.Name, Path.GetFileName(Path.GetDirectoryName(projectPath)));
            Assert.Equal(project.Name, ProjectProperty(document, "AssemblyName"));
            Assert.Equal(project.Name, ProjectProperty(document, "RootNamespace"));
            Assert.DoesNotContain("HrManagementSystem", project.RelativePath, StringComparison.OrdinalIgnoreCase);
        }

        var requiredFolders = ModuleDirectories()
            .Select(Path.GetFileName)
            .Prepend("Modules")
            .Prepend("BuildingBlocks");
        var folders = SolutionProjects()
            .Where(project => project.TypeGuid.Equals(SolutionFolderType, StringComparison.OrdinalIgnoreCase))
            .ToDictionary(project => project.Name, StringComparer.OrdinalIgnoreCase);
        foreach (var folder in requiredFolders)
            Assert.Contains(folder, folders.Keys, StringComparer.OrdinalIgnoreCase);
    }

    [Fact]
    public void RegistryMarkers_ContainEveryModuleExactlyOnce()
    {
        var registryPath = Path.Combine(ApiRoot, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs");
        var source = File.ReadAllText(registryPath);
        const string startMarker = "// <erp-module-registrations>";
        const string endMarker = "// </erp-module-registrations>";
        var start = source.IndexOf(startMarker, StringComparison.Ordinal);
        var end = source.IndexOf(endMarker, StringComparison.Ordinal);
        Assert.True(start >= 0 && end > start);
        var marked = source[start..end];

        foreach (var moduleRoot in ModuleDirectories())
        {
            var module = Path.GetFileName(moduleRoot);
            var count = Regex.Count(
                marked,
                $"new\\s+ErpSystem\\.Modules\\.{Regex.Escape(module)}\\.",
                RegexOptions.CultureInvariant);
            Assert.True(count == 1, $"Module {module} must be registered exactly once; found {count} registrations.");
        }
    }

    private static string? ProjectProperty(XDocument document, string name) =>
        document.Descendants(name).Select(element => element.Value).FirstOrDefault();

    private static string[] ProjectReferences(string project) =>
        XDocument.Load(project)
            .Descendants("ProjectReference")
            .Select(reference => reference.Attribute("Include")?.Value)
            .OfType<string>()
            .ToArray();

    private static IEnumerable<string> SourceFiles(string root) =>
        Directory.GetFiles(root, "*.cs", SearchOption.AllDirectories)
            .Where(path =>
                !path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
                && !path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase));

    private static IEnumerable<string> ModuleDirectories() =>
        Directory.GetDirectories(ModulesRoot)
            .Where(path => !Path.GetFileName(path).StartsWith('.'))
            .OrderBy(path => path, StringComparer.OrdinalIgnoreCase);

    private static SolutionProject[] SolutionProjects()
    {
        var solution = File.ReadAllText(Path.Combine(ApiRoot, "ErpSystem.sln"));
        return Regex.Matches(
                solution,
                "Project\\(\\\"(?<type>\\{[^}]+\\})\\\"\\) = \\\"(?<name>[^\\\"]+)\\\", \\\"(?<path>[^\\\"]+)\\\", \\\"(?<id>\\{[^}]+\\})\\\"",
                RegexOptions.CultureInvariant)
            .Select(match => new SolutionProject(
                match.Groups["type"].Value,
                match.Groups["name"].Value,
                match.Groups["path"].Value))
            .ToArray();
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

    private sealed record SolutionProject(string TypeGuid, string Name, string RelativePath);
}
