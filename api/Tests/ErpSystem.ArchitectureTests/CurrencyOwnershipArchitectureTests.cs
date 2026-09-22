using System.Runtime.CompilerServices;

namespace ErpSystem.ArchitectureTests;

public sealed class CurrencyOwnershipArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();

    [Fact]
    public void CurrencyMaster_IsOwnedOnlyByAccounting()
    {
        var hrRoot = Path.Combine(ApiRoot, "Modules", "HR");
        var accountingRoot = Path.Combine(ApiRoot, "Modules", "Accounting");

        Assert.False(File.Exists(Path.Combine(
            hrRoot,
            "ErpSystem.Modules.HR.Domain",
            "OrganizationalStructure",
            "Entities",
            "Currency.cs")));
        Assert.False(File.Exists(Path.Combine(
            hrRoot,
            "ErpSystem.Modules.HR.Infrastructure",
            "Persistence",
            "Configurations",
            "OrganizationalStructure",
            "CurrencyConfiguration.cs")));

        var hrDbContext = File.ReadAllText(Path.Combine(
            hrRoot,
            "ErpSystem.Modules.HR.Infrastructure",
            "Persistence",
            "ApplicationDbContext.cs"));
        var resources = File.ReadAllText(Path.Combine(
            hrRoot,
            "ErpSystem.Modules.HR.Application",
            "Features",
            "OrganizationalStructure",
            "Management",
            "OrganizationalResources.cs"));
        var accountingDbContext = File.ReadAllText(Path.Combine(
            accountingRoot,
            "ErpSystem.Modules.Accounting.Infrastructure",
            "AccountingDbContext.cs"));

        Assert.DoesNotContain("DbSet<Currency>", hrDbContext, StringComparison.Ordinal);
        Assert.DoesNotContain("currencies", resources, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("DbSet<Currency> Currencies", accountingDbContext, StringComparison.Ordinal);
    }

    [Fact]
    public void HrCurrencyValidation_DependsOnAccountingContractsOnly()
    {
        var hrRoot = Path.Combine(ApiRoot, "Modules", "HR");
        var sourceFiles = Directory.GetFiles(hrRoot, "*.cs", SearchOption.AllDirectories)
            .Where(path =>
                !path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase) &&
                !path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            .ToArray();

        var sources = sourceFiles.Select(File.ReadAllText).ToArray();
        Assert.Contains(sources, source =>
            source.Contains("IAccountingCurrencyCatalog", StringComparison.Ordinal));
        Assert.DoesNotContain(sources, source =>
            source.Contains("ErpSystem.Modules.Accounting.Infrastructure", StringComparison.Ordinal) ||
            source.Contains("ErpSystem.Modules.Accounting.Domain", StringComparison.Ordinal));
    }

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
