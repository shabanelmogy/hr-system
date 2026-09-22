using System.Text.Json;
using System.Text.RegularExpressions;
using System.Runtime.CompilerServices;
using ErpSystem.Api.Modules;
using ErpSystem.BuildingBlocks.Modularity;

namespace ErpSystem.IntegrationTests;

public sealed class ModuleMetadataConsistencyTests
{
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

    [Fact]
    public void HrAccountingCurrencyContractDependency_IsRequiredTechnicalLifecycleDependency()
    {
        var catalog = new ModuleCatalog(ErpModuleRegistry.Create());
        var hr = catalog.FindDefinition("hr");
        var accounting = catalog.FindDefinition("acc");

        Assert.NotNull(hr);
        Assert.NotNull(accounting);
        Assert.Contains("acc", hr!.RequiredModuleDependencies, StringComparer.OrdinalIgnoreCase);

        var lifecycleCodes = catalog.LifecycleModules.Select(module => module.Definition.Code).ToArray();
        Assert.True(
            Array.IndexOf(lifecycleCodes, "acc") < Array.IndexOf(lifecycleCodes, "hr"),
            "Accounting must enter lifecycle before HR because HR validates CurrencyCode snapshots through Accounting.Contracts.");
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

