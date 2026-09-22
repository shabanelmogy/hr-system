using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class ModuleGeneratorTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string GeneratorPath = Path.Combine(ApiRoot, "scripts", "New-ErpModule.ps1");

    [Fact]
    public void Generator_CreatesCanonicalModulePackageAndRequestsSolutionNesting()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);

        var result = RunGenerator(
            workspace,
            "-ModuleName OrderManagement -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.Equal(0, result.ExitCode);
        var moduleRoot = Path.Combine(workspace.ApiRoot, "Modules", "OrderManagement");
        var projectFiles = Directory.GetFiles(moduleRoot, "*.csproj", SearchOption.AllDirectories);
        Assert.Equal(7, projectFiles.Length);
        Assert.Contains(projectFiles, path => path.EndsWith("ErpSystem.Modules.OrderManagement.Tests.csproj", StringComparison.OrdinalIgnoreCase));
        Assert.True(File.Exists(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement.Tests",
            "Usings.cs")));

        var dbContext = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement.Infrastructure",
            "OrderManagementDbContext.cs"));
        Assert.Contains("public const string Schema = \"order_management\"", dbContext, StringComparison.Ordinal);
        Assert.Contains("HasDefaultSchema(Schema)", dbContext, StringComparison.Ordinal);
        Assert.Contains("HasEntityConfigurations", dbContext, StringComparison.Ordinal);

        var applicationProject = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement.Application",
            "ErpSystem.Modules.OrderManagement.Application.csproj"));
        Assert.Contains("ErpSystem.BuildingBlocks.Application.csproj", applicationProject, StringComparison.Ordinal);
        Assert.DoesNotContain(" Version=", applicationProject, StringComparison.Ordinal);
        var applicationRegistration = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement.Application",
            "DependencyInjection.cs"));
        Assert.Contains("AddApplicationPipeline()", applicationRegistration, StringComparison.Ordinal);

        var presentationProject = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement.Presentation",
            "ErpSystem.Modules.OrderManagement.Presentation.csproj"));
        Assert.Contains("Microsoft.AspNetCore.App", presentationProject, StringComparison.Ordinal);
        Assert.Contains("ErpSystem.BuildingBlocks.Authorization.csproj", presentationProject, StringComparison.Ordinal);
        Assert.DoesNotContain(" Version=", presentationProject, StringComparison.Ordinal);

        var designFactory = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement.Infrastructure",
            "OrderManagementDbContextDesignFactory.cs"));
        var moduleConnectionIndex = designFactory.IndexOf("\"OrderManagement\"", StringComparison.Ordinal);
        var defaultConnectionIndex = designFactory.IndexOf("\"DefaultConnection\"", StringComparison.Ordinal);
        Assert.True(moduleConnectionIndex >= 0 && moduleConnectionIndex < defaultConnectionIndex);

        var bootstrap = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.OrderManagement",
            "OrderManagementModule.cs"));
        var ensureSchemaIndex = bootstrap.IndexOf("ExecuteSqlRawAsync(EnsureSchemaSql", StringComparison.Ordinal);
        var migrationInspectionIndex = bootstrap.IndexOf("GetMigrations()", StringComparison.Ordinal);
        Assert.True(ensureSchemaIndex >= 0 && migrationInspectionIndex > ensureSchemaIndex);
        Assert.Contains("GetPendingMigrationsAsync", bootstrap, StringComparison.Ordinal);

        var host = File.ReadAllText(workspace.HostProject);
        Assert.Contains(
            "..\\Modules\\OrderManagement\\ErpSystem.Modules.OrderManagement\\ErpSystem.Modules.OrderManagement.csproj",
            host,
            StringComparison.Ordinal);
        var registry = File.ReadAllText(workspace.RegistryPath);
        Assert.Contains("new ErpSystem.Modules.OrderManagement.OrderManagementModule(),", registry, StringComparison.Ordinal);

        var manifestPath = Path.Combine(
            workspace.Root,
            "documentation",
            "modules",
            "order-management",
            "module.json");
        Assert.True(File.Exists(manifestPath));
        using (var manifest = JsonDocument.Parse(File.ReadAllText(manifestPath)))
        {
            var root = manifest.RootElement;
            Assert.Equal("OrderManagement", root.GetProperty("moduleName").GetString());
            Assert.Equal("order-management", root.GetProperty("docSlug").GetString());
            Assert.Equal("order_management", root.GetProperty("databaseSchema").GetString());
            Assert.Equal(
                "api/Modules/OrderManagement/ErpSystem.Modules.OrderManagement.Tests",
                root.GetProperty("testPath").GetString());
            Assert.Equal(
                "documentation/modules/order-management/FEATURE-QUALITY-GATE.md",
                root.GetProperty("documentationPaths").GetProperty("featureQualityGate").GetString());
        }

        var featureGate = File.ReadAllText(Path.Combine(
            workspace.Root,
            "documentation",
            "modules",
            "order-management",
            "FEATURE-QUALITY-GATE.md"));
        Assert.Contains("Archive or domain alternative", featureGate, StringComparison.Ordinal);
        Assert.Contains("Archived discovery / RecordStatus", featureGate, StringComparison.Ordinal);
        Assert.Contains("Shared atomic resource", featureGate, StringComparison.Ordinal);
        Assert.Contains("Stable localized errors", featureGate, StringComparison.Ordinal);

        var dotnetCalls = File.ReadAllLines(workspace.DotnetCallsPath)
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToArray();
        Assert.Equal(7, dotnetCalls.Length);
        Assert.All(dotnetCalls, call =>
            Assert.Contains("--solution-folder Modules/OrderManagement", call, StringComparison.OrdinalIgnoreCase));
        foreach (var project in projectFiles)
            Assert.Contains(dotnetCalls, call => call.Contains(project, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Generator_UsesCanonicalCrmClrSymbolsWhilePreservingCrmModuleIdentity()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);

        var result = RunGenerator(
            workspace,
            "-ModuleName CRM -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.Equal(0, result.ExitCode);
        var moduleRoot = Path.Combine(workspace.ApiRoot, "Modules", "CRM");
        Assert.True(File.Exists(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.CRM.Infrastructure",
            "CrmDbContext.cs")));
        Assert.True(File.Exists(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.CRM.Infrastructure",
            "CrmDbContextDesignFactory.cs")));
        Assert.True(File.Exists(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.CRM",
            "CrmModule.cs")));

        var applicationRegistration = File.ReadAllText(Path.Combine(
            moduleRoot,
            "ErpSystem.Modules.CRM.Application",
            "DependencyInjection.cs"));
        Assert.Contains("AddCrmApplication", applicationRegistration, StringComparison.Ordinal);

        var registry = File.ReadAllText(workspace.RegistryPath);
        Assert.Contains("new ErpSystem.Modules.CRM.CrmModule(),", registry, StringComparison.Ordinal);
        var host = File.ReadAllText(workspace.HostProject);
        Assert.Contains(
            "..\\Modules\\CRM\\ErpSystem.Modules.CRM\\ErpSystem.Modules.CRM.csproj",
            host,
            StringComparison.Ordinal);
    }

    [Fact]
    public void Generator_PreservesExplicitSchemaOverride()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);

        var result = RunGenerator(
            workspace,
            "-ModuleName OrderManagement -DatabaseSchema sales_ops -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.Equal(0, result.ExitCode);
        var source = File.ReadAllText(Path.Combine(
            workspace.ApiRoot,
            "Modules",
            "OrderManagement",
            "ErpSystem.Modules.OrderManagement.Infrastructure",
            "OrderManagementDbContext.cs"));
        Assert.Contains("public const string Schema = \"sales_ops\"", source, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("bad-name")]
    [InlineData("POS")]
    [InlineData("RetailPOS")]
    public void Generator_RejectsInvalidOrAbbreviatedNamesBeforeWriting(string moduleName)
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        var beforeHost = File.ReadAllBytes(workspace.HostProject);
        var beforeRegistry = File.ReadAllBytes(workspace.RegistryPath);
        var beforeSolution = File.ReadAllBytes(workspace.SolutionPath);

        var result = RunGenerator(
            workspace,
            "-ModuleName " + moduleName + " -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Equal(beforeHost, File.ReadAllBytes(workspace.HostProject));
        Assert.Equal(beforeRegistry, File.ReadAllBytes(workspace.RegistryPath));
        Assert.Equal(beforeSolution, File.ReadAllBytes(workspace.SolutionPath));
        Assert.Empty(Directory.GetDirectories(Path.Combine(workspace.ApiRoot, "Modules")));
        Assert.False(File.Exists(workspace.DotnetCallsPath));
    }

    [Fact]
    public void Generator_RejectsExistingModuleWithoutTouchingExistingContent()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        var existing = Path.Combine(workspace.ApiRoot, "Modules", "OrderManagement");
        Directory.CreateDirectory(existing);
        var sentinel = Path.Combine(existing, "keep.txt");
        File.WriteAllText(sentinel, "existing-module");
        var beforeHost = File.ReadAllBytes(workspace.HostProject);
        var beforeRegistry = File.ReadAllBytes(workspace.RegistryPath);

        var result = RunGenerator(
            workspace,
            "-ModuleName OrderManagement -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("already exists", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("existing-module", File.ReadAllText(sentinel));
        Assert.Equal(beforeHost, File.ReadAllBytes(workspace.HostProject));
        Assert.Equal(beforeRegistry, File.ReadAllBytes(workspace.RegistryPath));
        Assert.False(File.Exists(workspace.DotnetCallsPath));
    }

    [Fact]
    public void Generator_RequiresCentralPackagePolicyBeforeWriting()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        File.Delete(Path.Combine(workspace.ApiRoot, "Directory.Packages.props"));

        var result = RunGenerator(
            workspace,
            "-ModuleName OrderManagement -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Contains("Central package policy not found", result.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "OrderManagement")));
        Assert.False(File.Exists(workspace.DotnetCallsPath));
    }

    [Fact]
    public void Generator_RejectsIncompleteOrDisabledCentralPackagePolicyBeforeWriting()
    {
        using var incomplete = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        File.WriteAllText(
            Path.Combine(incomplete.ApiRoot, "Directory.Packages.props"),
            "<Project><PropertyGroup><ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>"
            + "<CentralPackageVersionOverrideEnabled>false</CentralPackageVersionOverrideEnabled></PropertyGroup>"
            + "<ItemGroup><PackageVersion Include=\"MediatR\" Version=\"12.5.0\" /></ItemGroup></Project>");

        var incompleteResult = RunGenerator(
            incomplete,
            "-ModuleName OrderManagement -ApiRoot \"" + incomplete.ApiRoot + "\"");
        Assert.NotEqual(0, incompleteResult.ExitCode);
        Assert.Contains("must define exactly one version", incompleteResult.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(incomplete.ApiRoot, "Modules", "OrderManagement")));

        using var disabled = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        var centralPath = Path.Combine(disabled.ApiRoot, "Directory.Packages.props");
        var policy = File.ReadAllText(centralPath)
            .Replace(
                "<ManagePackageVersionsCentrally Condition=\"$([System.String]::Copy('$(MSBuildProjectName)').StartsWith('ErpSystem.Modules.')) or $([System.String]::Copy('$(MSBuildProjectName)').StartsWith('ErpSystem.BuildingBlocks.')) or '$(MSBuildProjectName)' == 'ErpSystem.Api' or '$(MSBuildProjectName)' == 'ErpSystem.ArchitectureTests' or '$(MSBuildProjectName)' == 'ErpSystem.IntegrationTests'\">true</ManagePackageVersionsCentrally>",
                "<ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>",
                StringComparison.Ordinal);
        File.WriteAllText(centralPath, policy);

        var disabledResult = RunGenerator(
            disabled,
            "-ModuleName OrderManagement -ApiRoot \"" + disabled.ApiRoot + "\"");
        Assert.NotEqual(0, disabledResult.ExitCode);
        Assert.Contains("must enable ManagePackageVersionsCentrally", disabledResult.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(disabled.ApiRoot, "Modules", "OrderManagement")));
    }

    [Fact]
    public void Generator_RequiresDocumentationRootAndRejectsDocumentationCollision()
    {
        using var missingRoot = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        Directory.Delete(Path.Combine(missingRoot.Root, "documentation", "modules"), recursive: true);

        var missingResult = RunGenerator(
            missingRoot,
            "-ModuleName OrderManagement -ApiRoot \"" + missingRoot.ApiRoot + "\"");
        Assert.NotEqual(0, missingResult.ExitCode);
        Assert.Contains("Module documentation root not found", missingResult.Output, StringComparison.OrdinalIgnoreCase);
        Assert.False(Directory.Exists(Path.Combine(missingRoot.ApiRoot, "Modules", "OrderManagement")));

        using var collision = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        var target = Path.Combine(collision.Root, "documentation", "modules", "order-management");
        Directory.CreateDirectory(target);
        var sentinel = Path.Combine(target, "README.md");
        File.WriteAllText(sentinel, "existing-docs");

        var collisionResult = RunGenerator(
            collision,
            "-ModuleName OrderManagement -ApiRoot \"" + collision.ApiRoot + "\"");
        Assert.NotEqual(0, collisionResult.ExitCode);
        Assert.Contains("documentation directory already exists", collisionResult.Output, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("existing-docs", File.ReadAllText(sentinel));
        Assert.False(Directory.Exists(Path.Combine(collision.ApiRoot, "Modules", "OrderManagement")));
    }

    [Fact]
    public void Generator_WhatIfChangesNothing()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: false);
        var beforeHost = File.ReadAllBytes(workspace.HostProject);
        var beforeRegistry = File.ReadAllBytes(workspace.RegistryPath);
        var beforeSolution = File.ReadAllBytes(workspace.SolutionPath);

        var result = RunGenerator(
            workspace,
            "-ModuleName OrderManagement -ApiRoot \"" + workspace.ApiRoot + "\" -WhatIf");

        Assert.Equal(0, result.ExitCode);
        Assert.Equal(beforeHost, File.ReadAllBytes(workspace.HostProject));
        Assert.Equal(beforeRegistry, File.ReadAllBytes(workspace.RegistryPath));
        Assert.Equal(beforeSolution, File.ReadAllBytes(workspace.SolutionPath));
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "OrderManagement")));
        Assert.False(Directory.Exists(Path.Combine(
            workspace.Root,
            "documentation",
            "modules",
            "order-management")));
        Assert.False(File.Exists(workspace.DotnetCallsPath));
    }

    [Fact]
    public void Generator_LateFailureRollsBackOnlyResourcesCreatedByTheRun()
    {
        using var workspace = IsolatedWorkspace.Create(ApiRoot, failDotnet: true);
        var existingModule = Path.Combine(workspace.ApiRoot, "Modules", "ExistingModule");
        var existingDocumentation = Path.Combine(workspace.Root, "documentation", "modules", "existing-module");
        Directory.CreateDirectory(existingModule);
        Directory.CreateDirectory(existingDocumentation);
        var moduleSentinel = Path.Combine(existingModule, "keep.txt");
        var docsSentinel = Path.Combine(existingDocumentation, "keep.txt");
        File.WriteAllText(moduleSentinel, "module-sentinel");
        File.WriteAllText(docsSentinel, "docs-sentinel");
        var beforeHost = File.ReadAllBytes(workspace.HostProject);
        var beforeRegistry = File.ReadAllBytes(workspace.RegistryPath);
        var beforeSolution = File.ReadAllBytes(workspace.SolutionPath);

        var result = RunGenerator(
            workspace,
            "-ModuleName OrderManagement -ApiRoot \"" + workspace.ApiRoot + "\"");

        Assert.NotEqual(0, result.ExitCode);
        Assert.Equal(beforeHost, File.ReadAllBytes(workspace.HostProject));
        Assert.Equal(beforeRegistry, File.ReadAllBytes(workspace.RegistryPath));
        Assert.Equal(beforeSolution, File.ReadAllBytes(workspace.SolutionPath));
        Assert.False(Directory.Exists(Path.Combine(workspace.ApiRoot, "Modules", "OrderManagement")));
        Assert.False(Directory.Exists(Path.Combine(
            workspace.Root,
            "documentation",
            "modules",
            "order-management")));
        Assert.Equal("module-sentinel", File.ReadAllText(moduleSentinel));
        Assert.Equal("docs-sentinel", File.ReadAllText(docsSentinel));
    }

    private static GeneratorResult RunGenerator(IsolatedWorkspace workspace, string arguments)
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = FindPowerShell(),
                Arguments = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \""
                    + GeneratorPath + "\" " + arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };
        process.StartInfo.Environment["PATH"] =
            workspace.StubBin + Path.PathSeparator + process.StartInfo.Environment["PATH"];

        var output = new StringBuilder();
        process.OutputDataReceived += (_, args) =>
        {
            if (args.Data is not null)
                output.AppendLine(args.Data);
        };
        process.ErrorDataReceived += (_, args) =>
        {
            if (args.Data is not null)
                output.AppendLine(args.Data);
        };

        Assert.True(process.Start(), "Could not start PowerShell to run the module generator.");
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        Assert.True(process.WaitForExit(180_000), "Module generator timed out after 180 seconds.");
        process.WaitForExit();
        return new GeneratorResult(process.ExitCode, output.ToString());
    }

    private static string FindPowerShell()
    {
        foreach (var candidate in new[] { "pwsh", "powershell" })
        {
            try
            {
                using var process = Process.Start(new ProcessStartInfo
                {
                    FileName = candidate,
                    Arguments = "-NoProfile -NonInteractive -Command \"$PSVersionTable.PSVersion\"",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                });
                if (process is not null && process.WaitForExit(15_000) && process.ExitCode == 0)
                    return candidate;
            }
            catch
            {
            }
        }

        throw new InvalidOperationException("PowerShell is required to verify scripts/New-ErpModule.ps1.");
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

    private sealed record GeneratorResult(int ExitCode, string Output);

    private sealed class IsolatedWorkspace : IDisposable
    {
        private IsolatedWorkspace(string root, string apiRoot, string stubBin, string dotnetCallsPath)
        {
            Root = root;
            ApiRoot = apiRoot;
            StubBin = stubBin;
            DotnetCallsPath = dotnetCallsPath;
            HostProject = Path.Combine(apiRoot, "ErpSystem.Api", "ErpSystem.Api.csproj");
            RegistryPath = Path.Combine(apiRoot, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs");
            SolutionPath = Path.Combine(apiRoot, "ErpSystem.sln");
        }

        public string Root { get; }
        public string ApiRoot { get; }
        public string StubBin { get; }
        public string DotnetCallsPath { get; }
        public string HostProject { get; }
        public string RegistryPath { get; }
        public string SolutionPath { get; }

        public static IsolatedWorkspace Create(string realApiRoot, bool failDotnet)
        {
            var root = Path.Combine(Path.GetTempPath(), "ErpModuleGeneratorTests", Guid.NewGuid().ToString("N"));
            var apiRoot = Path.Combine(root, "api");
            var stubBin = Path.Combine(root, "stubbin");
            var calls = Path.Combine(root, "dotnet-calls.txt");
            Directory.CreateDirectory(Path.Combine(apiRoot, "Modules"));
            Directory.CreateDirectory(Path.Combine(apiRoot, "ErpSystem.Api", "Modules"));
            Directory.CreateDirectory(Path.Combine(root, "documentation", "modules"));
            Directory.CreateDirectory(stubBin);

            File.Copy(
                Path.Combine(realApiRoot, "Directory.Packages.props"),
                Path.Combine(apiRoot, "Directory.Packages.props"));
            File.WriteAllText(Path.Combine(apiRoot, "ErpSystem.sln"), "Microsoft Visual Studio Solution File\r\n");
            File.WriteAllText(
                Path.Combine(apiRoot, "ErpSystem.Api", "ErpSystem.Api.csproj"),
                "<Project Sdk=\"Microsoft.NET.Sdk.Web\">\r\n"
                + "  <ItemGroup>\r\n"
                + "    <!-- <erp-module-references> -->\r\n"
                + "    <!-- </erp-module-references> -->\r\n"
                + "  </ItemGroup>\r\n"
                + "</Project>\r\n");
            File.WriteAllText(
                Path.Combine(apiRoot, "ErpSystem.Api", "Modules", "ErpModuleRegistry.cs"),
                "public static class ErpModuleRegistry\n{\n    public static object[] Create() =>\n    [\n"
                + "        // <erp-module-registrations>\n"
                + "        // </erp-module-registrations>\n    ];\n}\n");

            var stubPath = Path.Combine(stubBin, OperatingSystem.IsWindows() ? "dotnet.cmd" : "dotnet");
            if (OperatingSystem.IsWindows())
            {
                File.WriteAllText(
                    stubPath,
                    "@echo off\r\n"
                    + "echo %*>>\"" + calls + "\"\r\n"
                    + (failDotnet ? "exit /b 42\r\n" : "exit /b 0\r\n"));
            }
            else
            {
                File.WriteAllText(
                    stubPath,
                    "#!/bin/sh\n"
                    + "echo \"$@\" >> \"" + calls + "\"\n"
                    + (failDotnet ? "exit 42\n" : "exit 0\n"));
                File.SetUnixFileMode(
                    stubPath,
                    UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute
                    | UnixFileMode.GroupRead | UnixFileMode.GroupExecute
                    | UnixFileMode.OtherRead | UnixFileMode.OtherExecute);
            }

            return new IsolatedWorkspace(root, apiRoot, stubBin, calls);
        }

        public void Dispose()
        {
            try
            {
                if (Directory.Exists(Root))
                    Directory.Delete(Root, recursive: true);
            }
            catch
            {
                // Best-effort cleanup; the OS temp directory is the fallback.
            }
        }
    }
}
