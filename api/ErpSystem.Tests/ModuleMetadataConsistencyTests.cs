using System.Text.Json;
using System.Text.RegularExpressions;
using System.Runtime.CompilerServices;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Modularity;

namespace ErpSystem.Tests;

public sealed class ModuleMetadataConsistencyTests
{
    [Fact]
    public void RuntimeModuleMetadata_MatchesModuleDocumentation()
    {
        var apiDirectory = FindApiDirectory();
        var documentationRoot = Path.Combine(
            Directory.GetParent(apiDirectory)!.FullName,
            "documentation",
            "modules");

        foreach (var module in ErpModuleRegistry.Create())
        {
            var definition = module.Definition;
            var slug = ToKebabCase(module.Name);
            var moduleJsonPath = Path.Combine(documentationRoot, slug, "module.json");
            Assert.True(File.Exists(moduleJsonPath), $"Missing module metadata documentation: {moduleJsonPath}");

            using var document = JsonDocument.Parse(File.ReadAllText(moduleJsonPath));
            var root = document.RootElement;
            Assert.Equal(module.Name, root.GetProperty("moduleName").GetString());
            Assert.Equal(definition.Version, root.GetProperty("version").GetString());
            Assert.Equal(
                definition.RequiredModuleDependencies,
                ReadStringArray(root, "requiredModuleDependencies"));
            Assert.Equal(
                definition.OptionalModuleDependencies,
                ReadStringArray(root, "optionalModuleDependencies"));
            Assert.Equal(definition.IsUserVisible, root.GetProperty("isUserVisible").GetBoolean());
            Assert.Equal(
                definition.AllowsTenantEntitlement,
                root.GetProperty("allowsTenantEntitlement").GetBoolean());
        }
    }

    [Fact]
    public void AccountingContactsContractDependency_IsOptionalTechnicalLifecycleDependency()
    {
        var catalog = new ModuleCatalog(ErpModuleRegistry.Create());
        var accounting = catalog.FindDefinition("acc");

        Assert.NotNull(accounting);
        Assert.Contains("contacts", accounting!.OptionalModuleDependencies, StringComparer.OrdinalIgnoreCase);
        Assert.DoesNotContain("contacts", accounting.RequiredModuleDependencies, StringComparer.OrdinalIgnoreCase);

        var lifecycleCodes = catalog.LifecycleModules.Select(module => module.Definition.Code).ToArray();
        Assert.True(
            Array.IndexOf(lifecycleCodes, "contacts") < Array.IndexOf(lifecycleCodes, "acc"),
            "When Contacts is installed, its public Contracts provider must enter lifecycle before Accounting's optional Contacts integration.");
    }

    [Fact]
    public void HrPlatformContractDependency_IsRequiredTechnicalLifecycleDependency()
    {
        var catalog = new ModuleCatalog(ErpModuleRegistry.Create());
        var hr = catalog.FindDefinition("hr");
        var platform = catalog.FindDefinition("platform");

        Assert.NotNull(hr);
        Assert.NotNull(platform);
        Assert.Contains("platform", hr!.RequiredModuleDependencies, StringComparer.OrdinalIgnoreCase);
        Assert.False(platform!.IsUserVisible);
        Assert.False(platform.AllowsTenantEntitlement);

        var lifecycleCodes = catalog.LifecycleModules.Select(module => module.Definition.Code).ToArray();
        Assert.True(
            Array.IndexOf(lifecycleCodes, "platform") < Array.IndexOf(lifecycleCodes, "hr"),
            "Platform must enter lifecycle before HR once HR consumes Platform contracts.");
    }

    private static IReadOnlyList<string> ReadStringArray(JsonElement root, string propertyName) =>
        root.GetProperty(propertyName)
            .EnumerateArray()
            .Select(item => item.GetString() ?? string.Empty)
            .ToArray();

    private static string FindApiDirectory([CallerFilePath] string sourcePath = "")
    {
        var startingDirectories = new[]
        {
            Path.GetDirectoryName(sourcePath),
            Directory.GetCurrentDirectory(),
            AppContext.BaseDirectory
        }
        .Where(path => !string.IsNullOrWhiteSpace(path))
        .Distinct(StringComparer.OrdinalIgnoreCase);

        foreach (var startingDirectory in startingDirectories)
        {
            for (var directory = new DirectoryInfo(startingDirectory!);
                 directory is not null;
                 directory = directory.Parent)
            {
                if (File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln")) &&
                    Directory.Exists(Path.Combine(directory.FullName, "Modules")))
                {
                    return directory.FullName;
                }
            }
        }

        throw new DirectoryNotFoundException("Could not locate ERP API root from source, working, or output paths.");
    }

    private static string ToKebabCase(string value)
    {
        var withAcronyms = Regex.Replace(value, "([A-Z]+)([A-Z][a-z])", "$1-$2");
        return Regex.Replace(withAcronyms, "([a-z0-9])([A-Z])", "$1-$2").ToLowerInvariant();
    }
}
