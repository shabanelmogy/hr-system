using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Text.Json;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class LocalizationOwnershipArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();

    [Fact]
    public void Modules_DoNotReplaceTheHostLocalizationFactory()
    {
        var modulesRoot = Path.Combine(ApiRoot, "Modules");
        var forbidden = new Regex(
            @"\bIStringLocalizerFactory\b|\.AddLocalization\s*\(|\.AddDataAnnotationsLocalization\s*\(",
            RegexOptions.CultureInvariant);

        var violations = Directory.GetFiles(modulesRoot, "*.cs", SearchOption.AllDirectories)
            .Where(path => !IsGeneratedPath(path))
            .Where(path => !path.Contains($"{Path.DirectorySeparatorChar}ErpSystem.Modules.", StringComparison.OrdinalIgnoreCase)
                || !path.Contains($".Tests{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            .Where(path => forbidden.IsMatch(File.ReadAllText(path)))
            .Select(path => Path.GetRelativePath(ApiRoot, path))
            .OrderBy(path => path, StringComparer.Ordinal)
            .ToArray();

        Assert.True(
            violations.Length == 0,
            "Global localization registration belongs to ErpSystem.Api. A module may consume "
            + "IStringLocalizer or implement a module-owned localization port, but it must not "
            + "replace the process-wide factory: " + string.Join("; ", violations));
    }

    [Fact]
    public void Host_OwnsTheSharedLocalizationFactoryAndResources()
    {
        var registration = File.ReadAllText(Path.Combine(
            ApiRoot,
            "ErpSystem.Api",
            "Hosting",
            "HostInfrastructureServiceCollectionExtensions.cs"));

        Assert.Contains("IStringLocalizerFactory, HostJsonStringLocalizerFactory", registration, StringComparison.Ordinal);
        Assert.True(File.Exists(Path.Combine(ApiRoot, "ErpSystem.Api", "Localization", "Resources", "en-US.json")));
        Assert.True(File.Exists(Path.Combine(ApiRoot, "ErpSystem.Api", "Localization", "Resources", "ar-EG.json")));
    }

    [Theory]
    [InlineData("en-US.json")]
    [InlineData("ar-EG.json")]
    public void HostLocalizationResources_AreValidNonEmptyJsonObjects(string fileName)
    {
        var path = Path.Combine(ApiRoot, "ErpSystem.Api", "Localization", "Resources", fileName);
        using var document = JsonDocument.Parse(
            File.ReadAllText(path),
            new JsonDocumentOptions
            {
                CommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true
            });

        Assert.Equal(JsonValueKind.Object, document.RootElement.ValueKind);
        Assert.True(document.RootElement.EnumerateObject().Any(), $"{fileName} must contain localization entries.");
        Assert.All(
            document.RootElement.EnumerateObject(),
            property => Assert.Equal(JsonValueKind.String, property.Value.ValueKind));
    }

    private static bool IsGeneratedPath(string path) =>
        path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        || path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        || path.Contains($"{Path.DirectorySeparatorChar}Migrations{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase);

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

        throw new DirectoryNotFoundException("Could not locate the ERP API root.");
    }
}
