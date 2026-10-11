using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;

namespace ErpSystem.ArchitectureTests;

/// <summary>
/// All modules share one service container. A plain <c>IUnitOfWork</c> registration is
/// replaced by the last module that registers one, so a handler that depends on it saves
/// through another module's DbContext: its changes are silently dropped while the command
/// still returns success (2026-10-11: new countries were reported as created but never
/// stored). Every module therefore owns a module-specific unit-of-work contract.
/// </summary>
public sealed class UnitOfWorkOwnershipArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();

    private static readonly Regex SharedUnitOfWork = new(
        @"(?<![A-Za-z0-9_])IUnitOfWork(?![A-Za-z0-9_])",
        RegexOptions.Compiled);

    [Fact]
    public void ModuleProductionCode_NeverDependsOnOrRegistersTheSharedUnitOfWork()
    {
        var offenders = Directory
            .GetFiles(Path.Combine(ApiRoot, "Modules"), "*.cs", SearchOption.AllDirectories)
            .Where(path => !IsBuildOutput(path) && !IsTestProject(path) && !IsModuleContract(path))
            .Where(path => SharedUnitOfWork.IsMatch(StripComments(File.ReadAllText(path))))
            .Select(path => Path.GetRelativePath(ApiRoot, path))
            .ToArray();

        Assert.True(
            offenders.Length == 0,
            "Use the module's own unit-of-work contract (for example IReferenceDataUnitOfWork) " +
            "instead of the shared IUnitOfWork: " + string.Join(", ", offenders));
    }

    [Theory]
    [InlineData("Accounting", "IAccountingUnitOfWork", "AccountingDbContext")]
    [InlineData("HR", "IHrUnitOfWork", "HrDbContext")]
    [InlineData("Platform", "IPlatformUnitOfWork", "PlatformDbContext")]
    [InlineData("ReferenceData", "IReferenceDataUnitOfWork", "ReferenceDataDbContext")]
    [InlineData("Reporting", "IReportingUnitOfWork", "ReportingDbContext")]
    public void ModuleRegistersItsOwnUnitOfWorkAgainstItsDbContext(
        string module,
        string contract,
        string dbContext)
    {
        var infrastructure = Path.Combine(
            ApiRoot,
            "Modules",
            module,
            $"ErpSystem.Modules.{module}.Infrastructure");
        var sources = Directory
            .GetFiles(infrastructure, "*.cs", SearchOption.AllDirectories)
            .Where(path => !IsBuildOutput(path))
            .Select(File.ReadAllText)
            .ToArray();

        Assert.Contains(sources, source =>
            Regex.IsMatch(source, $@"AddScoped<{contract}>\([^;]*GetRequiredService<{dbContext}>", RegexOptions.Singleline));
        Assert.Contains(sources, source =>
            Regex.IsMatch(source, $@"class\s+{dbContext}\b[^{{]*\b{contract}\b", RegexOptions.Singleline));
    }

    private static bool IsModuleContract(string path) =>
        Regex.IsMatch(
            Path.GetFileName(path),
            @"^I[A-Za-z]+UnitOfWork\.cs$") &&
        path.Contains($"{Path.DirectorySeparatorChar}Abstractions{Path.DirectorySeparatorChar}Persistence{Path.DirectorySeparatorChar}", StringComparison.Ordinal);

    private static bool IsTestProject(string path) =>
        path.Split(Path.DirectorySeparatorChar).Any(segment => segment.EndsWith(".Tests", StringComparison.Ordinal));

    private static bool IsBuildOutput(string path) =>
        path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase) ||
        path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase);

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
