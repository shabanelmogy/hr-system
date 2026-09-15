using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class LayerPurityTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ModulesRoot = Path.Combine(ApiRoot, "Modules");

    [Fact]
    public void DomainAndApplication_DoNotTakeWebOrEfFrameworkDependencies()
    {
        var violations = new List<string>();

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesRoot))
        {
            var module = Path.GetFileName(moduleDirectory);
            foreach (var layer in new[] { "Domain", "Application" })
            {
                var project = Path.Combine(
                    moduleDirectory,
                    $"ErpSystem.Modules.{module}.{layer}",
                    $"ErpSystem.Modules.{module}.{layer}.csproj");
                if (!File.Exists(project))
                    continue;

                var document = XDocument.Load(project);
                foreach (var package in document.Descendants("PackageReference"))
                {
                    var id = package.Attribute("Include")?.Value ?? string.Empty;
                    if (id.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal)
                        || id.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal))
                        violations.Add($"{module}.{layer} -> package {id}");
                }

                foreach (var framework in document.Descendants("FrameworkReference"))
                {
                    var id = framework.Attribute("Include")?.Value ?? string.Empty;
                    if (id.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal))
                        violations.Add($"{module}.{layer} -> framework {id}");
                }
            }
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void ApplicationAndInfrastructure_DoNotIntroduceGenericRepositoryAbstractions()
    {
        var declaration = new Regex(
            @"\b(?:class|interface|record)\s+\w*Repository\w*\s*<",
            RegexOptions.CultureInvariant);
        var violations = new List<string>();

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesRoot))
        {
            var module = Path.GetFileName(moduleDirectory);
            foreach (var layer in new[] { "Application", "Infrastructure" })
            {
                var layerRoot = Path.Combine(moduleDirectory, $"ErpSystem.Modules.{module}.{layer}");
                if (!Directory.Exists(layerRoot))
                    continue;

                foreach (var source in Directory.GetFiles(layerRoot, "*.cs", SearchOption.AllDirectories)
                             .Where(path => !IsGeneratedPath(path)))
                {
                    if (declaration.IsMatch(File.ReadAllText(source)))
                        violations.Add(Path.GetRelativePath(ApiRoot, source));
                }
            }
        }

        Assert.True(
            violations.Count == 0,
            "Generic repositories are forbidden; use feature-owned repositories/read stores instead: "
            + string.Join("; ", violations));
    }

    [Fact]
    public void DomainAndApplication_DoNotReadSystemClockDirectly()
    {
        var directClockAccess = new Regex(
            @"\b(?:DateTime|DateTimeOffset)\.(?:Now|UtcNow)\b",
            RegexOptions.CultureInvariant);
        var violations = new List<string>();

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesRoot))
        {
            var module = Path.GetFileName(moduleDirectory);
            foreach (var layer in new[] { "Domain", "Application" })
            {
                var layerRoot = Path.Combine(moduleDirectory, $"ErpSystem.Modules.{module}.{layer}");
                if (!Directory.Exists(layerRoot))
                    continue;

                foreach (var source in Directory.GetFiles(layerRoot, "*.cs", SearchOption.AllDirectories)
                             .Where(path => !IsGeneratedPath(path)))
                {
                    if (directClockAccess.IsMatch(File.ReadAllText(source)))
                        violations.Add(Path.GetRelativePath(ApiRoot, source));
                }
            }
        }

        Assert.True(
            violations.Count == 0,
            "Domain/Application business logic must use TimeProvider or an explicit clock abstraction: "
            + string.Join("; ", violations));
    }

    [Fact]
    public void DomainAndApplication_DoNotReadProcessEnvironmentDirectly()
    {
        var violations = new List<string>();

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesRoot))
        {
            var module = Path.GetFileName(moduleDirectory);
            foreach (var layer in new[] { "Domain", "Application" })
            {
                var layerRoot = Path.Combine(moduleDirectory, $"ErpSystem.Modules.{module}.{layer}");
                if (!Directory.Exists(layerRoot))
                    continue;

                foreach (var source in Directory.GetFiles(layerRoot, "*.cs", SearchOption.AllDirectories)
                             .Where(path => !IsGeneratedPath(path)))
                {
                    if (Regex.IsMatch(File.ReadAllText(source), @"\bEnvironment\."))
                        violations.Add(Path.GetRelativePath(ApiRoot, source));
                }
            }
        }

        Assert.True(
            violations.Count == 0,
            "Domain/Application code must obtain runtime environment metadata through an explicit context/port: "
            + string.Join("; ", violations));
    }

    [Fact]
    public void DomainAndApplication_DoNotUseCryptographicProvidersDirectly()
    {
        var directCryptoAccess = new Regex(
            @"\b(?:RandomNumberGenerator|SHA(?:1|256|384|512)|HMACSHA(?:1|256|384|512)|Aes|RSA|CryptographicOperations)\b",
            RegexOptions.CultureInvariant);
        var violations = new List<string>();

        foreach (var moduleDirectory in Directory.GetDirectories(ModulesRoot))
        {
            var module = Path.GetFileName(moduleDirectory);
            foreach (var layer in new[] { "Domain", "Application" })
            {
                var layerRoot = Path.Combine(moduleDirectory, $"ErpSystem.Modules.{module}.{layer}");
                if (!Directory.Exists(layerRoot))
                    continue;

                foreach (var source in Directory.GetFiles(layerRoot, "*.cs", SearchOption.AllDirectories)
                             .Where(path => !IsGeneratedPath(path)))
                {
                    if (directCryptoAccess.IsMatch(File.ReadAllText(source)))
                        violations.Add(Path.GetRelativePath(ApiRoot, source));
                }
            }
        }

        Assert.True(
            violations.Count == 0,
            "Domain/Application code must use crypto/security ports implemented by Infrastructure: "
            + string.Join("; ", violations));
    }

    [Fact]
    public void SharedApplicationBuildingBlock_RemainsModuleWebAndPersistenceIndependent()
    {
        var project = Path.Combine(
            ApiRoot,
            "BuildingBlocks",
            "ErpSystem.BuildingBlocks.Application",
            "ErpSystem.BuildingBlocks.Application.csproj");
        var document = XDocument.Load(project);

        Assert.DoesNotContain(
            document.Descendants("ProjectReference"),
            reference => (reference.Attribute("Include")?.Value ?? string.Empty)
                .Contains("Modules", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(
            document.Descendants("PackageReference"),
            reference =>
            {
                var id = reference.Attribute("Include")?.Value ?? string.Empty;
                return id.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal)
                    || id.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal);
            });
        Assert.DoesNotContain(
            document.Descendants("FrameworkReference"),
            reference => (reference.Attribute("Include")?.Value ?? string.Empty)
                .StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal));
    }

    private static bool IsGeneratedPath(string path) =>
        path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        || path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        || path.Contains($"{Path.DirectorySeparatorChar}Migrations{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase);

    private static string FindApiRoot([CallerFilePath] string sourcePath = "")
    {
        foreach (var startingPath in new[]
                 {
                     Path.GetDirectoryName(sourcePath),
                     Directory.GetCurrentDirectory(),
                     AppContext.BaseDirectory
                 }.Where(path => !string.IsNullOrWhiteSpace(path)))
        {
            for (var directory = new DirectoryInfo(startingPath!);
                 directory is not null;
                 directory = directory.Parent)
            {
                if (File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln"))
                    && Directory.Exists(Path.Combine(directory.FullName, "Modules")))
                    return directory.FullName;
            }
        }

        throw new DirectoryNotFoundException("Could not locate ERP API root.");
    }
}
