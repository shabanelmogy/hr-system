using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class ControllerArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ModulesRoot = Path.Combine(ApiRoot, "Modules");

    private static readonly Dictionary<string, IReadOnlySet<string>> AllowedAuxiliaryDependencies =
        new Dictionary<string, IReadOnlySet<string>>(StringComparer.OrdinalIgnoreCase)
        {
            [NormalizePath(Path.Combine(
                "HR",
                "ErpSystem.Modules.HR.Presentation",
                "Features",
                "Attendance",
                "Devices",
                "V1",
                "AttendanceAgentController.cs"))] = new HashSet<string>(StringComparer.Ordinal)
            {
                "IAttendanceAgentAuthenticator",
                "ICurrentActorScope"
            },
            [NormalizePath(Path.Combine(
                "Platform",
                "ErpSystem.Modules.Platform.Presentation",
                "Features",
                "Platform",
                "Files",
                "V1",
                "FilesController.cs"))] = new HashSet<string>(StringComparer.Ordinal)
            {
                "IValidator<UploadFileRequest>",
                "IValidator<UploadManyFilesRequest>",
                "IValidator<UploadImageRequest>"
            },
            [NormalizePath(Path.Combine(
                "Reporting",
                "ErpSystem.Modules.Reporting.Presentation",
                "Features",
                "Analytics",
                "Views",
                "V1",
                "ViewsController.cs"))] = new HashSet<string>(StringComparer.Ordinal)
            {
                "IWebHostEnvironment"
            }
        };

    [Fact]
    public void BusinessControllers_AreSenderFirst_WithOnlyExplicitTransportExceptions()
    {
        var violations = new List<string>();

        foreach (var file in ControllerFiles())
        {
            var source = File.ReadAllText(file);
            var match = Regex.Match(
                source,
                @"class\s+(?<name>\w+Controller)\s*\((?<parameters>.*?)\)\s*:\s*ControllerBase",
                RegexOptions.Singleline | RegexOptions.CultureInvariant);
            var relativePath = NormalizePath(Path.GetRelativePath(ModulesRoot, file));

            if (!match.Success)
            {
                violations.Add($"{relativePath}: controller primary constructor could not be inspected.");
                continue;
            }

            var controllerName = match.Groups["name"].Value;
            var parameterTypes = SplitParameters(match.Groups["parameters"].Value)
                .Select(GetParameterType)
                .ToArray();

            if (!parameterTypes.Contains("ISender", StringComparer.Ordinal))
            {
                violations.Add(
                    $"{relativePath}: {controllerName} must depend on ISender for API business use cases.");
            }

            AllowedAuxiliaryDependencies.TryGetValue(relativePath, out var allowed);
            foreach (var parameterType in parameterTypes.Where(type => !string.Equals(type, "ISender", StringComparison.Ordinal)))
            {
                if (allowed?.Contains(parameterType) == true)
                    continue;

                violations.Add(
                    $"{relativePath}: {controllerName} has non-CQRS constructor dependency '{parameterType}'. " +
                    "Move business orchestration behind an explicit command/query or document an exact transport-only exception.");
            }
        }

        Assert.True(
            violations.Count == 0,
            "Business controller architecture violations:" + Environment.NewLine + string.Join(Environment.NewLine, violations));
    }

    private static IEnumerable<string> ControllerFiles() =>
        Directory.GetFiles(ModulesRoot, "*Controller.cs", SearchOption.AllDirectories)
            .Where(path => path.Contains(".Presentation", StringComparison.OrdinalIgnoreCase))
            .Where(path =>
                !path.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
                && !path.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            .OrderBy(path => path, StringComparer.OrdinalIgnoreCase);

    private static IEnumerable<string> SplitParameters(string parameters)
    {
        var start = 0;
        var angleDepth = 0;
        var parenDepth = 0;
        var bracketDepth = 0;

        for (var index = 0; index < parameters.Length; index++)
        {
            switch (parameters[index])
            {
                case '<': angleDepth++; break;
                case '>': angleDepth--; break;
                case '(': parenDepth++; break;
                case ')': parenDepth--; break;
                case '[': bracketDepth++; break;
                case ']': bracketDepth--; break;
                case ',' when angleDepth == 0 && parenDepth == 0 && bracketDepth == 0:
                    yield return parameters[start..index];
                    start = index + 1;
                    break;
            }
        }

        if (start < parameters.Length)
            yield return parameters[start..];
    }

    private static string GetParameterType(string parameter)
    {
        var normalized = Regex.Replace(parameter.Trim(), @"\s+", " ");
        var lastSpace = normalized.LastIndexOf(' ');
        return lastSpace > 0 ? normalized[..lastSpace].Trim() : normalized;
    }

    private static string NormalizePath(string path) =>
        path.Replace('\\', '/');

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
