using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed partial class PermissionCatalogArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();

    [Fact]
    public void PermissionCatalogs_UseExactResourceActionsWithoutManage()
    {
        var permissionDeclarations = Directory
            .GetFiles(Path.Combine(ApiRoot, "Modules"), "*.cs", SearchOption.AllDirectories)
            .Where(IsPermissionCatalog)
            .SelectMany(path => PermissionDeclarationRegex().Matches(File.ReadAllText(path))
                .Select(match => new
                {
                    Path = path,
                    Name = match.Groups["name"].Value,
                    Value = match.Groups["value"].Value
                }))
            .ToArray();

        Assert.NotEmpty(permissionDeclarations);

        var invalid = permissionDeclarations
            .Where(permission => !PermissionValueRegex().IsMatch(permission.Value)
                || permission.Name.StartsWith("Manage", StringComparison.Ordinal)
                || permission.Value.Split(':')[1].StartsWith("Manage", StringComparison.Ordinal))
            .Select(permission => $"{Path.GetRelativePath(ApiRoot, permission.Path)}: {permission.Name} = {permission.Value}")
            .ToArray();

        Assert.True(
            invalid.Length == 0,
            "Permissions must use exact Resource:Action values; Manage/Manage* authorization is forbidden. "
            + string.Join("; ", invalid));
    }

    private static bool IsPermissionCatalog(string path)
    {
        var fileName = Path.GetFileName(path);
        return fileName.EndsWith("Permissions.cs", StringComparison.Ordinal)
            || fileName.Equals("PermissionContracts.cs", StringComparison.Ordinal);
    }

    [GeneratedRegex("""public\s+const\s+string\s+(?<name>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*"(?<value>[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*)"\s*;""")]
    private static partial Regex PermissionDeclarationRegex();

    [GeneratedRegex(@"^[A-Za-z][A-Za-z0-9]*:[A-Za-z][A-Za-z0-9]*$")]
    private static partial Regex PermissionValueRegex();

    private static string FindApiRoot([CallerFilePath] string sourcePath = "")
    {
        foreach (var start in new[]
                 {
                     Path.GetDirectoryName(sourcePath),
                     Directory.GetCurrentDirectory(),
                     AppContext.BaseDirectory
                 }.Where(value => !string.IsNullOrWhiteSpace(value)))
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
