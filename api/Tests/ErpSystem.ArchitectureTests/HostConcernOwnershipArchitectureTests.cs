using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;

namespace ErpSystem.ArchitectureTests;

/// <summary>
/// Settings that apply to every module's HTTP pipeline belong to the host. HR used to
/// register the global validation filter, JSON options and the Syncfusion license, so
/// removing HR would have silently changed every other module; the request correlation id
/// also had four copies reading two different keys (2026-10-11 foundation cleanup).
/// </summary>
public sealed class HostConcernOwnershipArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();

    [Theory]
    [InlineData(@"\bFilters\s*\.\s*Add(Service)?\b", "global MVC filters")]
    [InlineData(@"\bAddJsonOptions\s*\(", "global JSON options")]
    [InlineData(@"\bGetCorrelationId\s*\(\s*(this\s+)?HttpContext\b", "a correlation id helper")]
    [InlineData(@"\bCorrelationId""\s*;", "a correlation id item key")]
    public void ModuleProductionCode_DoesNotOwnHostConcerns(string pattern, string concern)
    {
        var regex = new Regex(pattern, RegexOptions.CultureInvariant);
        var offenders = ModuleProductionSources()
            .Where(path => regex.IsMatch(StripComments(File.ReadAllText(path))))
            .Select(path => Path.GetRelativePath(ApiRoot, path))
            .ToArray();

        Assert.True(
            offenders.Length == 0,
            $"Modules must not define {concern}; the host (ErpSystem.Api/Hosting) or " +
            $"ErpSystem.BuildingBlocks.Presentation owns it: {string.Join(", ", offenders)}");
    }

    [Fact]
    public void SyncfusionLicense_IsRegisteredOnlyByReporting()
    {
        var owners = ModuleProductionSources()
            .Where(path => File.ReadAllText(path).Contains("SyncfusionLicenseProvider.RegisterLicense", StringComparison.Ordinal))
            .Select(path => Path.GetRelativePath(ApiRoot, path).Split(Path.DirectorySeparatorChar)[1])
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        Assert.Equal(["Reporting"], owners);
    }

    private static IEnumerable<string> ModuleProductionSources() =>
        Directory
            .GetFiles(Path.Combine(ApiRoot, "Modules"), "*.cs", SearchOption.AllDirectories)
            .Where(path =>
                !path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase) &&
                !path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase) &&
                !path.Split(Path.DirectorySeparatorChar).Any(segment => segment.EndsWith(".Tests", StringComparison.Ordinal)));

    private static string StripComments(string source) =>
        Regex.Replace(source, @"//[^\n]*|/\*.*?\*/", string.Empty, RegexOptions.Singleline);

    private static string FindApiRoot([CallerFilePath] string sourcePath = "")
    {
        foreach (var start in new[] { Path.GetDirectoryName(sourcePath), Directory.GetCurrentDirectory(), AppContext.BaseDirectory }
                     .Where(value => !string.IsNullOrWhiteSpace(value)))
        {
            for (var directory = new DirectoryInfo(start!); directory is not null; directory = directory.Parent)
            {
                if (File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln")) &&
                    Directory.Exists(Path.Combine(directory.FullName, "Modules")))
                    return directory.FullName;
            }
        }

        throw new DirectoryNotFoundException("Could not locate the ERPSYSTEM API root.");
    }
}
